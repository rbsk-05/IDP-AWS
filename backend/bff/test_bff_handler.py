import sys
import os
import json
import pytest
from unittest.mock import MagicMock, patch

@pytest.fixture(autouse=True)
def setup_handler_path():
    current_dir = os.path.dirname(__file__)
    if current_dir in sys.path:
        sys.path.remove(current_dir)
    sys.path.insert(0, current_dir)
    if 'handler' in sys.modules:
        del sys.modules['handler']

@pytest.fixture
def mock_lambda_client():
    with patch('boto3.client') as mock_client_factory:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client
        yield mock_client

def make_payload_response(status_code, body):
    mock_payload = MagicMock()
    mock_payload.read.return_value = json.dumps({
        'statusCode': status_code,
        'body': json.dumps(body)
    }).encode('utf-8')
    return {'Payload': mock_payload}

def test_shop_endpoint_success(mock_lambda_client):
    from handler import lambda_handler
    
    mock_products = [
        {"id": "hp-general-1", "name": "Marauder's Map", "price": 2500.0, "stock": 20},
        {"id": "hp-general-2", "name": "Gryffindor Scarf", "price": 1200.0, "stock": 50}
    ]
    
    mock_cart = {
        "userId": "user@gmail.com",
        "items": [
            {"productId": "hp-general-1", "name": "Marauder's Map", "price": 2500.0, "quantity": 1}
        ]
    }
    
    def side_effect(FunctionName, InvocationType, Payload):
        if FunctionName == 'tf-darshan-product-lambda':
            return make_payload_response(200, mock_products)
        elif FunctionName == 'tf-darshan-cart-lambda':
            return make_payload_response(200, mock_cart)
        return make_payload_response(400, {})
        
    mock_lambda_client.invoke.side_effect = side_effect
    
    event = {
        "path": "/api/shop",
        "httpMethod": "GET",
        "requestContext": {
            "requestId": "bff-req-1",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    body = json.loads(response['body'])
    assert 'products' in body
    assert 'cart' in body
    assert len(body['products']) == 2
    assert body['cart']['userId'] == "user@gmail.com"
    assert len(body['cart']['items']) == 1

def test_dashboard_endpoint_unauthorized(mock_lambda_client):
    from handler import lambda_handler
    
    event = {
        "path": "/api/bff/dashboard",
        "httpMethod": "GET"
    }
    
    response = lambda_handler(event, None)
    assert response['statusCode'] == 401
    body = json.loads(response['body'])
    assert body['error'] == 'Unauthorized'

def test_dashboard_endpoint_success(mock_lambda_client):
    from handler import lambda_handler
    
    mock_products = [
        {"id": "hp-general-1", "name": "Marauder's Map", "price": 2500.0, "stock": 20}
    ]
    
    mock_orders = [
        {
            "orderId": "ORDER-12345",
            "userId": "user@gmail.com",
            "timestamp": 1600000000,
            "items": [
                {"productId": "hp-general-1", "quantity": 2, "price": 2500.0}
            ],
            "total": 5000.0
        }
    ]
    
    def side_effect(FunctionName, InvocationType, Payload):
        if FunctionName == 'tf-darshan-product-lambda':
            return make_payload_response(200, mock_products)
        elif FunctionName == 'tf-darshan-order-lambda':
            return make_payload_response(200, mock_orders)
        return make_payload_response(400, {})
        
    mock_lambda_client.invoke.side_effect = side_effect
    
    event = {
        "path": "/api/bff/dashboard",
        "httpMethod": "GET",
        "requestContext": {
            "requestId": "bff-req-2",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    body = json.loads(response['body'])
    assert 'orders' in body
    assert 'products' in body
    assert len(body['orders']) == 1
    
    order = body['orders'][0]
    assert order['items'][0]['productId'] == 'hp-general-1'
    assert 'productDetails' in order['items'][0]
    assert order['items'][0]['productDetails']['name'] == "Marauder's Map"

def test_bff_caching_logic(mock_lambda_client):
    from handler import lambda_handler
    import handler
    
    handler.CACHE = {}
    handler.CACHE_TTL = 5
    
    mock_products = [
        {"id": "hp-general-1", "name": "Marauder's Map", "price": 2500.0, "stock": 20}
    ]
    mock_cart = {"items": []}
    
    def side_effect(FunctionName, InvocationType, Payload):
        if FunctionName == 'tf-darshan-product-lambda':
            return make_payload_response(200, mock_products)
        elif FunctionName == 'tf-darshan-cart-lambda':
            return make_payload_response(200, mock_cart)
        return make_payload_response(400, {})
        
    mock_lambda_client.invoke.side_effect = side_effect
    
    event = {
        "path": "/api/shop",
        "httpMethod": "GET",
        "requestContext": {
            "requestId": "bff-req-3",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    
    response1 = lambda_handler(event, None)
    assert response1['statusCode'] == 200
    
    response2 = lambda_handler(event, None)
    assert response2['statusCode'] == 200
    
    product_invocations = [
        call for call in mock_lambda_client.invoke.call_args_list
        if call[1]['FunctionName'] == 'tf-darshan-product-lambda'
    ]
    assert len(product_invocations) == 1
    
    cart_invocations = [
        call for call in mock_lambda_client.invoke.call_args_list
        if call[1]['FunctionName'] == 'tf-darshan-cart-lambda'
    ]
    assert len(cart_invocations) == 2
