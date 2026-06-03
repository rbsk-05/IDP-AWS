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

#FUNCTION TO GET THE TABLE
def get_table(event):
    correlation_id = get_correlation_id(event)
    # Support dynamic table switching for isolated testing
    # Check headers case-insensitively
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    is_test = headers.get('x-test-suite') == 'true'
    prod_table_name = os.environ.get('TABLE_NAME', 'tf-darshan-product-table')
    
    target_table = prod_table_name
    if is_test:
        # Switch tf- to test-
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
    path_parameters = event.get('pathParameters') or {}
    table = get_table(event)
    correlation_id = get_correlation_id(event)
    
    # Handle preflight CORS
    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})

    if http_method == 'GET' and 'id' in path_parameters:
        return get_product(table, path_parameters['id'], correlation_id)
    elif http_method == 'DELETE' and 'id' in path_parameters:
        return delete_product(table, path_parameters['id'], correlation_id)
    elif http_method in ['PUT', 'PATCH'] and 'id' in path_parameters:
        return update_product(table, path_parameters['id'], event.get('body'), event, correlation_id)
    elif http_method == 'GET':
        return list_products(table, event, correlation_id)
    elif http_method == 'POST':
        return create_product(table, event.get('body'), event, correlation_id)

    return respond(400, {'message': f'Unsupported method {http_method}'})

def get_product(table, product_id, correlation_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        response = table.get_item(Key={'id': product_id})
        if 'Item' in response:
            return respond(200, response['Item'])
        return respond(404, {'message': 'Product not found'})
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Get product failed: {str(e)}")
        return respond(500, {'error': str(e)})

def list_products(table, event, correlation_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        user_id = get_user_id(event)
        response = table.scan()
        items = response.get('Items', [])
        
        # If Admin, show everything
        if user_id in ['admin@gmail.com', 'mock-admin-token-12345']:
            return respond(200, items)
            
        # Standard users see their own products plus seeds ('anonymous') and admin-created products
        filtered = [
            item for item in items
            if item.get('userId', 'anonymous') == user_id 
            or item.get('userId', 'anonymous') == 'anonymous'
            or item.get('userId', 'anonymous') in ['admin@gmail.com', 'mock-admin-token-12345']
        ]
        return respond(200, filtered)
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] List products failed: {str(e)}")
        return respond(500, {'error': str(e)})

def create_product(table, body, event, correlation_id):
    if not table or not body:
        return respond(400, {'error': 'Bad request - body required'})
    try:
        data = json.loads(body, parse_float=decimal.Decimal)
        if 'id' not in data:
            data['id'] = str(uuid.uuid4())
            
        user_id = get_user_id(event)
        data['userId'] = user_id
        
        table.put_item(Item=data)
        print(f"[EVENT] [CorrelationID: {correlation_id}] Product created: {data['id']}")
        return respond(201, {'message': 'Product created', 'product': data})
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Product creation failed: {str(e)}")
        return respond(500, {'error': str(e)})

def update_product(table, product_id, body, event, correlation_id):
    if not table or not body:
        return respond(400, {'error': 'Bad request - body required'})
    try:
        data = json.loads(body, parse_float=decimal.Decimal)
        data['id'] = product_id
        
        user_id = get_user_id(event)
        existing = table.get_item(Key={'id': product_id}).get('Item')
        if existing:
            data['userId'] = existing.get('userId', user_id)
        else:
            data['userId'] = user_id
            
        table.put_item(Item=data)
        print(f"[EVENT] [CorrelationID: {correlation_id}] Product updated: {product_id}")
        return respond(200, {'message': 'Product updated', 'product': data})
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Product update failed: {str(e)}")
        return respond(500, {'error': str(e)})

def delete_product(table, product_id, correlation_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        table.delete_item(Key={'id': product_id})
        print(f"[EVENT] [CorrelationID: {correlation_id}] Product deleted: {product_id}")
        return respond(200, {'message': 'Product deleted', 'id': product_id})
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Product deletion failed: {str(e)}")
        return respond(500, {'error': str(e)})
