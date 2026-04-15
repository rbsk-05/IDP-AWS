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
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_id = claims.get('sub', 'anonymous')

    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})
    if http_method == 'GET':
        return get_cart(user_id)
    elif http_method in ['POST', 'PUT']:
        return update_cart(user_id, event.get('body'))
    elif http_method == 'DELETE':
        return delete_cart(user_id, event.get('body'))

    return respond(400, {'message': f'Unsupported method {http_method}'})

def get_cart(user_id):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        response = table.get_item(Key={'userId': user_id})
        if 'Item' in response:
            item = response['Item']
            # Normalize Decimals in items list
            normalized_items = []
            for i in item.get('items', []):
                normalized_items.append({
                    'productId': i.get('productId', ''),
                    'name': i.get('name', ''),
                    'price': float(i.get('price', 0)),
                    'quantity': int(i.get('quantity', 1))
                })
            return respond(200, {'userId': user_id, 'items': normalized_items})
        return respond(200, {'userId': user_id, 'items': []})
    except Exception as e:
        return respond(500, {'error': str(e)})

def update_cart(user_id, body):
    if not table or not body:
        return respond(400, {'error': 'Bad request - body required'})
    try:
        data = json.loads(body)
        raw_items = data.get('items', [])

        # Normalize and convert types to DynamoDB-safe Decimals
        safe_items = []
        for i in raw_items:
            safe_items.append({
                'productId': str(i.get('productId', '')),
                'name': str(i.get('name', '')),
                'price': decimal.Decimal(str(i.get('price', 0))),
                'quantity': decimal.Decimal(str(int(i.get('quantity', 1))))
            })

        table.put_item(Item={
            'userId': user_id,
            'items': safe_items
        })
        return respond(200, {'message': 'Cart updated', 'itemCount': len(safe_items)})
    except Exception as e:
        return respond(500, {'error': str(e)})


def delete_cart(user_id, body=None):
    if not table:
        return respond(500, {'error': 'Table not configured'})
    try:
        if body:
            data = json.loads(body)
            product_id = data.get('productId')
            if product_id:
                current = table.get_item(Key={'userId': user_id}).get('Item', {})
                items = current.get('items', [])
                filtered_items = [i for i in items if str(i.get('productId')) != str(product_id)]
                table.put_item(Item={'userId': user_id, 'items': filtered_items})
                return respond(200, {'message': 'Item removed', 'itemCount': len(filtered_items)})

        table.delete_item(Key={'userId': user_id})
        return respond(200, {'message': 'Cart cleared', 'itemCount': 0})
    except Exception as e:
        return respond(500, {'error': str(e)})
