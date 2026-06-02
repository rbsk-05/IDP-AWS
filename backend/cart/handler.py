import json
import os
import boto3
import decimal

dynamodb = boto3.resource('dynamodb')

def get_table(event):
    # Support dynamic table switching for isolated testing
    # Check headers case-insensitively
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    is_test = headers.get('x-test-suite') == 'true'
    prod_table_name = os.environ.get('TABLE_NAME', 'tf-darshan-cart-table')
    
    target_table = prod_table_name
    if is_test:
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
    user_id = get_user_id(event)
    table = get_table(event)

    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})
    if http_method == 'GET':
        return get_cart(table, user_id)
    elif http_method in ['POST', 'PUT']:
        return update_cart(table, user_id, event.get('body'))
    elif http_method == 'DELETE':
        return delete_cart(table, user_id, event.get('body'))

    return respond(400, {'message': f'Unsupported method {http_method}'})

def get_cart(table, user_id):
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

def update_cart(table, user_id, body):
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

def delete_cart(table, user_id, body=None):
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
