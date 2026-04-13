import json
import os
import boto3
import decimal
import uuid

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME')
table = dynamodb.Table(table_name) if table_name else None

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
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

    # Handle preflight CORS
    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})

    if http_method == 'GET' and 'id' in path_parameters:
        return get_product(path_parameters['id'])
    elif http_method == 'GET':
        return list_products()
    elif http_method == 'POST':
        return create_product(event.get('body'))
    elif http_method in ['PUT', 'PATCH']:
        return create_product(event.get('body'))  # upsert via PUT

    return respond(400, {'message': f'Unsupported method {http_method}'})

def get_product(product_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        response = table.get_item(Key={'id': product_id})
        if 'Item' in response:
            return respond(200, response['Item'])
        return respond(404, {'message': 'Product not found'})
    except Exception as e:
        return respond(500, {'error': str(e)})

def list_products():
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        response = table.scan()
        return respond(200, response.get('Items', []))
    except Exception as e:
        return respond(500, {'error': str(e)})

def create_product(body):
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
