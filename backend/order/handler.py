import json
import os
import boto3
import decimal
import time
import uuid

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

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
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    is_test = headers.get('x-test-suite') == 'true'
    prod_table_name = os.environ.get('TABLE_NAME', 'tf-darshan-order-table')
    
    target_table = prod_table_name
    if is_test:
        target_table = prod_table_name.replace('tf-', 'test-')
    
    print(f"[AUDIT] [CorrelationID: {correlation_id}] Headers: {headers}")
    print(f"[AUDIT] [CorrelationID: {correlation_id}] Test Mode: {is_test}")
    print(f"[AUDIT] [CorrelationID: {correlation_id}] Target Table: {target_table}")
    
    return dynamodb.Table(target_table)

def get_product_table(event):
    correlation_id = get_correlation_id(event)
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    is_test = headers.get('x-test-suite') == 'true'
    prod_table_name = os.environ.get('PRODUCT_TABLE_NAME', 'tf-darshan-product-table')
    
    target_table = prod_table_name
    if is_test:
        target_table = prod_table_name.replace('tf-', 'test-')
        
    print(f"[AUDIT] [CorrelationID: {correlation_id}] Target Product Table: {target_table}")
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
    correlation_id = get_correlation_id(event)

    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})
    if http_method == 'GET':
        return get_order_history(table, user_id, correlation_id)
    elif http_method == 'POST':
        return place_order(table, user_id, event, correlation_id)

    return respond(400, {'message': f'Unsupported method {http_method}'})

def get_order_history(table, user_id, correlation_id):
    try:
        # If Admin, scan all orders in the database; otherwise filter by user_id
        if user_id in ['admin@gmail.com', 'mock-admin-token-12345']:
            response = table.scan()
        else:
            response = table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('userId').eq(user_id)
            )
        orders = response.get('Items', [])
        # Sort by timestamp descending
        orders.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        return respond(200, orders)
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Get order history failed: {str(e)}")
        return respond(500, {'error': str(e)})

def place_order(table, user_id, event, correlation_id):
    body = event.get('body')
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

        # Normalize float prices to Decimal for DynamoDB compatibility
        safe_items = []
        for i in cart_items:
            safe_items.append({
                'productId': str(i.get('productId', '')),
                'name': str(i.get('name', '')),
                'price': decimal.Decimal(str(i.get('price', 0))),
                'quantity': decimal.Decimal(str(int(i.get('quantity', 1))))
            })

        # 1. Update Product Inventory with Stock Rollback
        product_table = get_product_table(event)
        successful_decrements = []

        try:
            for item in safe_items:
                pid = item['productId']
                qty = item['quantity']
                name = item['name']
                
                try:
                    product_table.update_item(
                        Key={'id': pid},
                        UpdateExpression="SET stock = stock - :qty",
                        ConditionExpression="stock >= :qty",
                        ExpressionAttributeValues={':qty': qty}
                    )
                    successful_decrements.append((pid, qty))
                except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
                    raise Exception(f"Insufficient stock or product not found for item: {name} ({pid})")
                except Exception as e:
                    raise Exception(f"Failed to update stock for item {name}: {str(e)}")

            # 2. Save to DynamoDB
            order_item = {
                'orderId': order_id,
                'userId': user_id,
                'items': safe_items,
                'total': decimal.Decimal(str(total_price)),
                'timestamp': timestamp,
                'status': 'PLACED'
            }
            table.put_item(Item=order_item)

        except Exception as checkout_err:
            # ROLLBACK PHASE: Add back the quantities we decremented
            print(f"[ROLLBACK] [CorrelationID: {correlation_id}] Order checkout failed. Rolling back stock for successfully updated products: {successful_decrements}")
            for pid, qty in successful_decrements:
                try:
                    product_table.update_item(
                        Key={'id': pid},
                        UpdateExpression="SET stock = stock + :qty",
                        ExpressionAttributeValues={':qty': qty}
                    )
                except Exception as rollback_err:
                    print(f"[FATAL] [CorrelationID: {correlation_id}] Stock rollback failed for product {pid}: {str(rollback_err)}")
            raise checkout_err

        # 3. Send SNS Notification
        topic_arn = os.environ.get('SNS_TOPIC_ARN')
        if topic_arn:
            try:
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
                print(f"[AUDIT] [CorrelationID: {correlation_id}] SNS message successfully published for order {order_id}")
            except Exception as sns_err:
                print(f"[WARNING] [CorrelationID: {correlation_id}] Failed to send SNS notification: {str(sns_err)}")

        return respond(201, {
            'message': 'Order placed successfully!',
            'orderId': order_id
        })
    except Exception as e:
        print(f"[ERROR] [CorrelationID: {correlation_id}] Order placement failed: {str(e)}")
        return respond(500, {'error': str(e)})
