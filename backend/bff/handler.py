import json
import os
import boto3
import time
import uuid
import decimal
import concurrent.futures

lambda_client = boto3.client('lambda')

# In-memory cache
CACHE = {}
CACHE_TTL = int(os.environ.get('CACHE_TTL', '10'))  # Default 10 seconds

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def get_correlation_id(event):
    request_context = event.get('requestContext', {}) if isinstance(event, dict) else {}
    correlation_id = request_context.get('requestId')
    if not correlation_id:
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()} if isinstance(event, dict) else {}
        correlation_id = headers.get('x-correlation-id') or headers.get('x-amzn-trace-id')
        if not correlation_id:
            correlation_id = "GEN-" + str(uuid.uuid4())[:8]
    return correlation_id

def get_user_id(event):
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_id = claims.get('sub') or claims.get('email')
    if not user_id:
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()} if isinstance(event, dict) else {}
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

def respond(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-test-suite',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def invoke_lambda(function_name, event):
    try:
        response = lambda_client.invoke(
            FunctionName=function_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(event)
        )
        payload_data = response['Payload'].read().decode('utf-8')
        payload = json.loads(payload_data)
        return payload
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}

def get_cached_products(product_lambda, products_event, correlation_id):
    global CACHE
    now = time.time()
    user_id = get_user_id(products_event)
    cache_key = f"products_{user_id}"
    
    if cache_key in CACHE:
        cached_val, expiry = CACHE[cache_key]
        if now < expiry:
            print(f"[AUDIT] [CorrelationID: {correlation_id}] Cache HIT for key: {cache_key}")
            print(f"[METRIC] [CorrelationID: {correlation_id}] CacheHit=1 CacheMiss=0 Key={cache_key}")
            return cached_val
            
    print(f"[AUDIT] [CorrelationID: {correlation_id}] Cache MISS for key: {cache_key}")
    print(f"[METRIC] [CorrelationID: {correlation_id}] CacheHit=0 CacheMiss=1 Key={cache_key}")
    
    products_res = invoke_lambda(product_lambda, products_event)
    if products_res.get('statusCode') == 200:
        products_body = json.loads(products_res.get('body', '[]'))
        CACHE[cache_key] = (products_body, now + CACHE_TTL)
        return products_body
    else:
        return json.loads(products_res.get('body', '[]'))

def handle_shop(event, product_lambda, cart_lambda, correlation_id):
    headers = event.get('headers', {})
    request_context = event.get('requestContext', {})
    
    products_event = {
        'httpMethod': 'GET',
        'headers': headers,
        'requestContext': request_context
    }
    
    cart_event = {
        'httpMethod': 'GET',
        'headers': headers,
        'requestContext': request_context
    }
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_products = executor.submit(get_cached_products, product_lambda, products_event, correlation_id)
        future_cart = executor.submit(invoke_lambda, cart_lambda, cart_event)
        
        products_body = future_products.result()
        cart_res = future_cart.result()
        
    cart_body = json.loads(cart_res.get('body', '{"items": []}'))
    
    return respond(200, {
        'products': products_body,
        'cart': cart_body
    })

def handle_dashboard(event, order_lambda, product_lambda, correlation_id):
    headers = event.get('headers', {})
    request_context = event.get('requestContext', {})
    user_id = get_user_id(event)
    
    if user_id == 'anonymous':
        return respond(401, {'error': 'Unauthorized'})
        
    orders_event = {
        'httpMethod': 'GET',
        'headers': headers,
        'requestContext': request_context
    }
    
    products_event = {
        'httpMethod': 'GET',
        'headers': headers,
        'requestContext': request_context
    }
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_orders = executor.submit(invoke_lambda, order_lambda, orders_event)
        future_products = executor.submit(get_cached_products, product_lambda, products_event, correlation_id)
        
        orders_res = future_orders.result()
        products_body = future_products.result()
        
    orders_status = orders_res.get('statusCode', 200)
    if orders_status != 200:
        return respond(orders_status, json.loads(orders_res.get('body', '{}')))
        
    orders_body = json.loads(orders_res.get('body', '[]'))
    
    product_map = {p['id']: p for p in products_body if isinstance(p, dict) and 'id' in p}
    
    aggregated_orders = []
    for order in orders_body:
        if not isinstance(order, dict):
            continue
        items = order.get('items', [])
        resolved_items = []
        for item in items:
            if not isinstance(item, dict):
                continue
            pid = item.get('productId')
            resolved_item = item.copy()
            if pid in product_map:
                resolved_item['productDetails'] = product_map[pid]
            resolved_items.append(resolved_item)
            
        resolved_order = order.copy()
        resolved_order['items'] = resolved_items
        aggregated_orders.append(resolved_order)
        
    return respond(200, {
        'orders': aggregated_orders,
        'products': products_body
    })

def lambda_handler(event, context):
    path = event.get('path', '')
    http_method = event.get('httpMethod', '')
    correlation_id = get_correlation_id(event)
    
    product_lambda = os.environ.get('PRODUCT_LAMBDA_NAME', 'tf-darshan-product-lambda')
    cart_lambda = os.environ.get('CART_LAMBDA_NAME', 'tf-darshan-cart-lambda')
    order_lambda = os.environ.get('ORDER_LAMBDA_NAME', 'tf-darshan-order-lambda')
    
    print(f"[AUDIT] [CorrelationID: {correlation_id}] BFF Path: {path}, Method: {http_method}")
    
    if http_method == 'OPTIONS':
        return respond(200, {'message': 'ok'})
        
    if path.endswith('/api/shop') or '/api/shop/' in path:
        if http_method == 'GET':
            return handle_shop(event, product_lambda, cart_lambda, correlation_id)
        return respond(405, {'error': 'Method not allowed'})
        
    elif path.endswith('/api/bff/dashboard') or '/api/bff/dashboard/' in path:
        if http_method == 'GET':
            return handle_dashboard(event, order_lambda, product_lambda, correlation_id)
        return respond(405, {'error': 'Method not allowed'})
        
    return respond(400, {'error': f'Unsupported path {path} or method {http_method}'})
