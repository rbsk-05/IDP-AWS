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
def mock_athena_client():
    with patch('boto3.client') as mock_client_factory:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client
        
        # Mock start_query_execution
        mock_client.start_query_execution.return_value = {'QueryExecutionId': 'test-query-id-123'}
        
        # Mock get_query_execution
        mock_client.get_query_execution.return_value = {
            'QueryExecution': {
                'Status': {
                    'State': 'SUCCEEDED'
                }
            }
        }
        
        # Mock paginator get_query_results
        mock_paginator = MagicMock()
        mock_client.get_paginator.return_value = mock_paginator
        
        mock_page_iterator = [
            {
                'ResultSet': {
                    'Rows': [
                        {
                            'Data': [
                                {'VarCharValue': 'year'},
                                {'VarCharValue': 'month'},
                                {'VarCharValue': 'day'},
                                {'VarCharValue': 'daily_revenue'}
                            ]
                        },
                        {
                            'Data': [
                                {'VarCharValue': '2026'},
                                {'VarCharValue': '06'},
                                {'VarCharValue': '03'},
                                {'VarCharValue': '250.50'}
                            ]
                        }
                    ]
                }
            }
        ]
        mock_paginator.paginate.return_value = mock_page_iterator
        
        yield mock_client

def test_analytics_endpoint_forbidden_for_user(mock_athena_client):
    from handler import lambda_handler
    
    event = {
        "path": "/api/analytics/revenue",
        "httpMethod": "GET",
        "headers": {
            "x-test-suite": "user"
        }
    }
    
    response = lambda_handler(event, None)
    assert response['statusCode'] == 403
    body = json.loads(response['body'])
    assert 'error' in body
    assert 'Forbidden' in body['error']

def test_analytics_endpoint_success_for_admin(mock_athena_client):
    from handler import lambda_handler
    
    # Set required environment variables
    os.environ['ATHENA_OUTPUT_BUCKET'] = 'test-analytics-bucket'
    
    event = {
        "path": "/api/analytics/revenue",
        "httpMethod": "GET",
        "headers": {
            "x-test-suite": "admin"
        }
    }
    
    response = lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    body = json.loads(response['body'])
    assert isinstance(body, list)
    assert len(body) == 1
    assert body[0]['year'] == '2026'
    assert body[0]['month'] == '06'
    assert body[0]['day'] == '03'
    assert body[0]['daily_revenue'] == '250.50'
    
    # Assert MSCK REPAIR and SELECT queries were started
    assert mock_athena_client.start_query_execution.call_count == 2

def test_analytics_endpoint_missing_bucket(mock_athena_client):
    from handler import lambda_handler
    
    if 'ATHENA_OUTPUT_BUCKET' in os.environ:
        del os.environ['ATHENA_OUTPUT_BUCKET']
        
    event = {
        "path": "/api/analytics/revenue",
        "httpMethod": "GET",
        "headers": {
            "x-test-suite": "admin"
        }
    }
    
    response = lambda_handler(event, None)
    assert response['statusCode'] == 500
    body = json.loads(response['body'])
    assert 'error' in body
    assert 'missing output bucket' in body['error']

def test_analytics_endpoint_options(mock_athena_client):
    from handler import lambda_handler
    
    event = {
        "path": "/api/analytics/revenue",
        "httpMethod": "OPTIONS"
    }
    
    response = lambda_handler(event, None)
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['message'] == 'ok'
