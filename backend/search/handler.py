import json
import os
import boto3
import decimal
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
    # Support dynamic table switching for isolated testing
    # Check headers case-insensitively
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    is_test = headers.get('x-test-suite') == 'true'
    prod_table_name = os.environ.get('TABLE_NAME', 'tf-darshan-product-table')
    
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

def get_user_id(event):
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_id = claims.get('sub') or claims.get('email')
    if not user_id:
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
        auth = headers.get('authorization', 'anonymous')
        user_id = auth.replace('Bearer ', '').strip()
        
    # Robustly decode Cognito JWT tokens to extract email/sub if sent directly in Authorization header
    if isinstance(user_id, str) and user_id.startswith('eyJ') and user_id.count('.') == 2:
        try:
            import base64
            payload_b64 = user_id.split('.')[1]
            payload_b64 += '=' * (-len(payload_b64) % 4)
            payload_json = base64.b64decode(payload_b64).decode('utf-8')
            payload = json.loads(payload_json)
            decoded_id = payload.get('email') or payload.get('sub')
            if decoded_id:
                user_id = decoded_id
        except Exception as e:
            print(f"[WARNING] Failed to decode JWT token: {str(e)}")
            
    return user_id if user_id else 'anonymous'

def lambda_handler(event, context):
    http_method = event.get('httpMethod', '')
    query_string = event.get('queryStringParameters') or {}
    q = query_string.get('q', '').lower()
    table = get_table(event)
    correlation_id = get_correlation_id(event)

    # Handle preflight CORS
    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})

    if http_method == 'GET':
        return search(table, q, event, correlation_id)

    return respond(400, {'message': f'Unsupported method {http_method}'})

def search(table, query, event, correlation_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        user_id = get_user_id(event)
        response = table.scan()
        items = response.get('Items', [])

        # If standard user, filter so search doesn't show other users' products (except seeds and admin products)
        if user_id not in ['admin@gmail.com', 'mock-admin-token-12345']:
            items = [
                item for item in items
                if item.get('userId', 'anonymous') == user_id 
                or item.get('userId', 'anonymous') == 'anonymous'
                or item.get('userId', 'anonymous') in ['admin@gmail.com', 'mock-admin-token-12345']
            ]

        if query:
            results = [item for item in items if query in json.dumps(item, cls=DecimalEncoder).lower()]
        else:
            results = items

        print(f"[EVENT] [CorrelationID: {correlation_id}] User {user_id} searched with query '{query}', found {len(results)} items")
        return respond(200, results)
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Search failed: {str(e)}")
        return respond(500, {'error': str(e)})
