import json
import os
import boto3
import decimal
import uuid

dynamodb = boto3.resource('dynamodb')

#FUNCTION TO GET THE TABLE
def get_table(event):
    # Support dynamic table switching for isolated testing
    # Check headers case-insensitively
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    is_test = headers.get('x-test-suite') == 'true'
    prod_table_name = os.environ.get('TABLE_NAME', 'tf-darshan-product-table')
    
    target_table = prod_table_name
    if is_test:
        # Switch tf- to test-
        target_table = prod_table_name.replace('tf-', 'test-')
    
    print(f"[AUDIT] Headers: {headers}")
    print(f"[AUDIT] Test Mode: {is_test}")
    print(f"[AUDIT] Target Table: {target_table}")
    
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
    path_parameters = event.get('pathParameters') or {}
    table = get_table(event)
    
    # Handle preflight CORS
    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})

    if http_method == 'GET' and 'id' in path_parameters:
        return get_product(table, path_parameters['id'])
    elif http_method == 'DELETE' and 'id' in path_parameters:
        return delete_product(table, path_parameters['id'])
    elif http_method in ['PUT', 'PATCH'] and 'id' in path_parameters:
        return update_product(table, path_parameters['id'], event.get('body'))
    elif http_method == 'GET':
        return list_products(table)
    elif http_method == 'POST':
        return create_product(table, event.get('body'))

    return respond(400, {'message': f'Unsupported method {http_method}'})

def get_product(table, product_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        response = table.get_item(Key={'id': product_id})
        if 'Item' in response:
            return respond(200, response['Item'])
        return respond(404, {'message': 'Product not found'})
    except Exception as e:
        return respond(500, {'error': str(e)})

def list_products(table):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        response = table.scan()
        return respond(200, response.get('Items', []))
    except Exception as e:
        return respond(500, {'error': str(e)})

def create_product(table, body):
    if not table or not body:
        return respond(400, {'error': 'Bad request - body required'})
    try:
        data = json.loads(body, parse_float=decimal.Decimal)
        if 'id' not in data:
            data['id'] = str(uuid.uuid4())
        table.put_item(Item=data)
        return respond(201, {'message': 'Product created', 'product': data})
    except Exception as e:
        return respond(500, {'error': str(e)})

def update_product(table, product_id, body):
    if not table or not body:
        return respond(400, {'error': 'Bad request - body required'})
    try:
        data = json.loads(body, parse_float=decimal.Decimal)
        data['id'] = product_id
        table.put_item(Item=data)
        return respond(200, {'message': 'Product updated', 'product': data})
    except Exception as e:
        return respond(500, {'error': str(e)})

def delete_product(table, product_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        table.delete_item(Key={'id': product_id})
        return respond(200, {'message': 'Product deleted', 'id': product_id})
    except Exception as e:
        return respond(500, {'error': str(e)})
