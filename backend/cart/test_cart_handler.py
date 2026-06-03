import sys
import os
import json
import decimal
import pytest
import boto3
from moto import mock_aws

@pytest.fixture(autouse=True)
def setup_handler_path():
    current_dir = os.path.dirname(__file__)
    if current_dir in sys.path:
        sys.path.remove(current_dir)
    sys.path.insert(0, current_dir)
    if 'handler' in sys.modules:
        del sys.modules['handler']

@pytest.fixture(scope="function")
def setup_dynamo():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "ap-southeast-1"
    os.environ["TABLE_NAME"] = "tf-darshan-cart-table"
    
    with mock_aws():
        db = boto3.resource("dynamodb", region_name="ap-southeast-1")
        table = db.create_table(
            TableName="tf-darshan-cart-table",
            KeySchema=[{"AttributeName": "userId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "userId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )
        yield table

def test_get_cart_empty(setup_dynamo):
    from handler import lambda_handler
    
    event = {
        "httpMethod": "GET",
        "requestContext": {
            "requestId": "test-req-201",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["userId"] == "user@gmail.com"
    assert body["items"] == []

def test_update_cart(setup_dynamo):
    from handler import lambda_handler
    
    event = {
        "httpMethod": "POST",
        "body": '{"items": [{"productId": "hp-general-1", "name": "Marauder\'s Map", "price": 2500.0, "quantity": 2}]}',
        "requestContext": {
            "requestId": "test-req-202",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["message"] == "Cart updated"
    assert body["itemCount"] == 1
    
    # Retrieve cart and assert
    event_get = {
        "httpMethod": "GET",
        "requestContext": {
            "requestId": "test-req-203",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    response_get = lambda_handler(event_get, None)
    body_get = json.loads(response_get["body"])
    assert len(body_get["items"]) == 1
    assert body_get["items"][0]["productId"] == "hp-general-1"
    assert body_get["items"][0]["quantity"] == 2
    assert body_get["items"][0]["price"] == 2500.0

def test_delete_specific_item_from_cart(setup_dynamo):
    from handler import lambda_handler
    
    # Pre-populate cart with 2 items
    setup_dynamo.put_item(Item={
        "userId": "user@gmail.com",
        "items": [
            {"productId": "hp-general-1", "name": "Marauder's Map", "price": decimal.Decimal("2500.00"), "quantity": decimal.Decimal("1")},
            {"productId": "hp-electronics-1", "name": "Omnioculars", "price": decimal.Decimal("4500.00"), "quantity": decimal.Decimal("2")}
        ]
    })
    
    # Delete specific product from cart
    event = {
        "httpMethod": "DELETE",
        "body": '{"productId": "hp-general-1"}',
        "requestContext": {
            "requestId": "test-req-204",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["message"] == "Item removed"
    assert body["itemCount"] == 1
    
    # Verify remaining item is Omnioculars
    item = setup_dynamo.get_item(Key={"userId": "user@gmail.com"}).get("Item")
    assert len(item["items"]) == 1
    assert item["items"][0]["productId"] == "hp-electronics-1"

def test_clear_cart_completely(setup_dynamo):
    from handler import lambda_handler
    
    # Pre-populate cart
    setup_dynamo.put_item(Item={
        "userId": "user@gmail.com",
        "items": [
            {"productId": "hp-general-1", "name": "Marauder's Map", "price": decimal.Decimal("2500.00"), "quantity": decimal.Decimal("1")}
        ]
    })
    
    # Clear cart completely
    event = {
        "httpMethod": "DELETE",
        "requestContext": {
            "requestId": "test-req-205",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["message"] == "Cart cleared"
    
    # Verify cart record is deleted
    item = setup_dynamo.get_item(Key={"userId": "user@gmail.com"}).get("Item")
    assert item is None
