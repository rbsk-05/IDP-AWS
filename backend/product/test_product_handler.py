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
    os.environ["TABLE_NAME"] = "tf-darshan-product-table"
    
    with mock_aws():
        db = boto3.resource("dynamodb", region_name="ap-southeast-1")
        table = db.create_table(
            TableName="tf-darshan-product-table",
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )
        yield table

def test_create_product(setup_dynamo):
    from handler import lambda_handler
    
    event = {
        "httpMethod": "POST",
        "body": '{"name": "Gryffindor House Scarf", "price": 1200.0, "category": "General", "stock": 50}',
        "requestContext": {
            "requestId": "test-req-123",
            "authorizer": {
                "claims": {
                    "email": "admin@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert body["message"] == "Product created"
    assert body["product"]["name"] == "Gryffindor House Scarf"
    assert body["product"]["price"] == 1200.0
    assert body["product"]["stock"] == 50

def test_get_product_not_found(setup_dynamo):
    from handler import lambda_handler
    
    event = {
        "httpMethod": "GET",
        "pathParameters": {"id": "non-existent-id"},
        "requestContext": {
            "requestId": "test-req-124"
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 404
    body = json.loads(response["body"])
    assert body["message"] == "Product not found"

def test_get_product_success(setup_dynamo):
    from handler import lambda_handler
    
    # Pre-populate table
    setup_dynamo.put_item(Item={
        "id": "hp-general-1",
        "name": "Marauder's Map",
        "price": decimal.Decimal("2500.00"),
        "stock": decimal.Decimal("20"),
        "userId": "admin@gmail.com"
    })
    
    event = {
        "httpMethod": "GET",
        "pathParameters": {"id": "hp-general-1"},
        "requestContext": {
            "requestId": "test-req-125"
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["id"] == "hp-general-1"
    assert body["name"] == "Marauder's Map"
    assert body["price"] == 2500.0

def test_list_products_admin_vs_user(setup_dynamo):
    from handler import lambda_handler
    
    # Pre-populate table with two items: one user-owned and one seed
    setup_dynamo.put_item(Item={
        "id": "hp-general-1",
        "name": "Marauder's Map",
        "price": decimal.Decimal("2500.00"),
        "stock": decimal.Decimal("20"),
        "userId": "anonymous"
    })
    setup_dynamo.put_item(Item={
        "id": "custom-user-item",
        "name": "Custom Wand",
        "price": decimal.Decimal("100.00"),
        "stock": decimal.Decimal("5"),
        "userId": "user@gmail.com"
    })
    
    # Test User View: should only see user's own items + seeds
    event_user = {
        "httpMethod": "GET",
        "requestContext": {
            "requestId": "test-req-126",
            "authorizer": {
                "claims": {
                    "email": "user@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event_user, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert len(body) == 2  # Sees both (seeds and own wand)
    
    # Test Other User View: should only see seeds (cannot see user@gmail.com's item)
    event_other = {
        "httpMethod": "GET",
        "requestContext": {
            "requestId": "test-req-127",
            "authorizer": {
                "claims": {
                    "email": "other@gmail.com"
                }
            }
        }
    }
    response = lambda_handler(event_other, None)
    body = json.loads(response["body"])
    assert len(body) == 1
    assert body[0]["id"] == "hp-general-1"
    
    # Test Admin View: should see everything
    event_admin = {
        "httpMethod": "GET",
        "requestContext": {
            "requestId": "test-req-128",
            "authorizer": {
                "claims": {
                    "email": "admin@gmail.com"
                }
            }
        }
    }
    response = lambda_handler(event_admin, None)
    body = json.loads(response["body"])
    assert len(body) == 2

def test_update_product(setup_dynamo):
    from handler import lambda_handler
    
    # Pre-populate table
    setup_dynamo.put_item(Item={
        "id": "hp-general-1",
        "name": "Marauder's Map",
        "price": decimal.Decimal("2500.00"),
        "stock": decimal.Decimal("20"),
        "userId": "admin@gmail.com"
    })
    
    event = {
        "httpMethod": "PUT",
        "pathParameters": {"id": "hp-general-1"},
        "body": '{"name": "Marauder\'s Map Enhanced", "price": 2800.0, "category": "General", "stock": 15}',
        "requestContext": {
            "requestId": "test-req-129",
            "authorizer": {
                "claims": {
                    "email": "admin@gmail.com"
                }
            }
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["message"] == "Product updated"
    assert body["product"]["name"] == "Marauder's Map Enhanced"
    assert body["product"]["price"] == 2800.0
    assert body["product"]["stock"] == 15

def test_delete_product(setup_dynamo):
    from handler import lambda_handler
    
    # Pre-populate table
    setup_dynamo.put_item(Item={
        "id": "hp-general-1",
        "name": "Marauder's Map",
        "price": decimal.Decimal("2500.00"),
        "stock": decimal.Decimal("20"),
        "userId": "admin@gmail.com"
    })
    
    event = {
        "httpMethod": "DELETE",
        "pathParameters": {"id": "hp-general-1"},
        "requestContext": {
            "requestId": "test-req-130"
        }
    }
    
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["message"] == "Product deleted"
    
    # Verify it is deleted
    item = setup_dynamo.get_item(Key={"id": "hp-general-1"}).get("Item")
    assert item is None
