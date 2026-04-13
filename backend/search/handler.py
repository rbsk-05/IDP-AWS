import json
import os
import boto3
import decimal

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
    query_string = event.get('queryStringParameters') or {}
    q = query_string.get('q', '').lower()

    # Handle preflight CORS
    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})

    if http_method == 'GET':
        return search(q)

    return respond(400, {'message': f'Unsupported method {http_method}'})

def search(query):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        response = table.scan()
        items = response.get('Items', [])

        if query:
            results = [item for item in items if query in json.dumps(item, cls=DecimalEncoder).lower()]
        else:
            results = items

        return respond(200, results)
    except Exception as e:
        return respond(500, {'error': str(e)})
