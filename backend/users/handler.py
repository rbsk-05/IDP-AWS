import json
import os
import boto3
import decimal
import time
import uuid

dynamodb = boto3.resource('dynamodb')

def get_correlation_id(event):
    request_context = event.get('requestContext', {}) if isinstance(event, dict) else {}
    correlation_id = request_context.get('requestId')
    if not correlation_id:
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()} if isinstance(event, dict) else {}
        correlation_id = headers.get('x-correlation-id') or headers.get('x-amzn-trace-id')
        if not correlation_id:
            correlation_id = "GEN-" + str(uuid.uuid4())[:8]
    return correlation_id

def get_table(event):
    correlation_id = get_correlation_id(event)
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    is_test = headers.get('x-test-suite') == 'true'
    prod_table_name = os.environ.get('TABLE_NAME', 'tf-darshan-users-table')
    
    target_table = prod_table_name
    if is_test:
        target_table = prod_table_name.replace('tf-', 'test-')
        
    print(f"[AUDIT] [CorrelationID: {correlation_id}] Headers: {headers}")
    print(f"[AUDIT] [CorrelationID: {correlation_id}] Test Mode: {is_test}")
    print(f"[AUDIT] [CorrelationID: {correlation_id}] Target Table: {target_table}")
    
    return dynamodb.Table(target_table)

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-test-suite',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def respond(status_code, body):
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def lambda_handler(event, context):
    http_method = event.get('httpMethod', '')
    query_string = event.get('queryStringParameters') or {}
    email = query_string.get('email')
    table = get_table(event)
    correlation_id = get_correlation_id(event)

    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})
    if http_method == 'GET':
        return get_user(table, email, correlation_id)
    elif http_method in ['POST', 'PUT']:
        return create_or_update_user(table, event.get('body'), correlation_id)

    return respond(400, {'message': f'Unsupported method {http_method}'})

def get_user(table, email, correlation_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    if not email:
        return respond(400, {'error': 'Email parameter is required'})
    try:
        response = table.get_item(Key={'email': email.lower()})
        if 'Item' in response:
            return respond(200, response['Item'])
        return respond(404, {'message': 'User not found'})
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Get user registration failed for {email}: {str(e)}")
        return respond(500, {'error': str(e)})

def create_or_update_user(table, body, correlation_id):
    if not table or not body:
        return respond(400, {'error': 'Bad request - body required'})
    try:
        data = json.loads(body)
        email = data.get('email')
        if not email:
            return respond(400, {'error': 'Email is required to store registration'})
        
        item = {
            'email': email.lower(),
            'role': data.get('role', 'user'),
            'name': data.get('name', email.split('@')[0]),
            'updatedAt': int(time.time())
        }
        
        # Keep original creation time if available
        existing = table.get_item(Key={'email': email.lower()}).get('Item')
        if existing:
            item['createdAt'] = existing.get('createdAt', item['updatedAt'])
        else:
            item['createdAt'] = item['updatedAt']
            
        table.put_item(Item=item)
        print(f"[EVENT] [CorrelationID: {correlation_id}] User registration stored: {email.lower()}")
        return respond(200, {'message': 'User registration stored', 'user': item})
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Create or update user failed: {str(e)}")
        return respond(500, {'error': str(e)})
