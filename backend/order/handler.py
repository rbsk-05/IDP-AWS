import json
import os
import boto3
import decimal
import time
import uuid

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

def get_table(event):
    # Support dynamic table switching for isolated testing
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    is_test = headers.get('x-test-suite') == 'true'
    prod_table_name = os.environ.get('TABLE_NAME', 'tf-darshan-order-table')
    
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

def lambda_handler(event, context):
    http_method = event.get('httpMethod', '')
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_id = claims.get('sub', 'anonymous')
    table = get_table(event)

    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})
    if http_method == 'GET':
        return get_order_history(table, user_id)
    elif http_method == 'POST':
        return place_order(table, user_id, event.get('body'))

    return respond(400, {'message': f'Unsupported method {http_method}'})

def get_order_history(table, user_id):
    try:
        # Query orders for the user
        # Note: In a real system, we might use a GSI or just Query if userId is the partition key.
        # Here userId is the range key, orderId is partition key.
        # For simplicity in this wizarding example, we'll scan by userId (filtering).
        # In production this should be a GSI.
        response = table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('userId').eq(user_id)
        )
        orders = response.get('Items', [])
        # Sort by timestamp descending
        orders.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        return respond(200, orders)
    except Exception as e:
        return respond(500, {'error': str(e)})

def place_order(table, user_id, body):
    if not body:
        return respond(400, {'error': 'Body required'})
    try:
        data = json.loads(body)
        cart_items = data.get('items', [])
        total_price = data.get('total', 0)
        
        if not cart_items:
            return respond(400, {'error': 'Cannot place an empty order'})

        order_id = f"ORDER-{str(uuid.uuid4())[:8].upper()}"
        timestamp = int(time.time())

        # 1. Save to DynamoDB
        order_item = {
            'orderId': order_id,
            'userId': user_id,
            'items': cart_items,
            'total': decimal.Decimal(str(total_price)),
            'timestamp': timestamp,
            'status': 'PLACED'
        }
        table.put_item(Item=order_item)

        # 2. Send SNS Notification
        topic_arn = os.environ.get('SNS_TOPIC_ARN')
        if topic_arn:
            dt_string = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(timestamp))
            items_list = "\n".join([f"- {i.get('quantity')}x {i.get('name')}" for i in cart_items])
            
            message = (
                f"🧙‍♂️ New Magical Order Placed!\n\n"
                f"Order ID: {order_id}\n"
                f"Timestamp: {dt_string} UTC\n"
                f"---------------------------------\n"
                f"Products Ordered:\n{items_list}\n"
                f"---------------------------------\n"
                f"Total Cost: ₹{total_price}\n\n"
                f"Customer ID: {user_id}\n\n"
                f"Check the Ministry Console for details."
            )
            sns.publish(
                TopicArn=topic_arn,
                Subject=f"Magical Order Success: {order_id}",
                Message=message
            )

        return respond(201, {
            'message': 'Order placed successfully!',
            'orderId': order_id
        })
    except Exception as e:
        print(f"Error placing order: {str(e)}")
        return respond(500, {'error': str(e)})
