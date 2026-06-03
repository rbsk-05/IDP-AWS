import boto3
import logging
import json
import decimal
import uuid

dynamodb = boto3.resource('dynamodb')

def get_correlation_id(event):
    request_context = event.get('requestContext', {}) if isinstance(event, dict) else {}
    correlation_id = request_context.get('requestId')
    if not correlation_id:
        headers = {k.lower(): v for k, v in event.get('headers', {}).items()} if isinstance(event, dict) else {}
        correlation_id = headers.get('x-correlation-id') or headers.get('x-amzn-trace-id')
        if not correlation_id:
            correlation_id = "GEN-" + str(uuid.uuid4())[:8]
    return correlation_id

CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-test-suite',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' 
}

def respond(status_code, body):
  return {
    'statusCode' : status_code,
    'headers' : CORS_HEADERS,
    'body' : json.dumps(body, cls=DecimalEncoder)
  }

def get_table(correlation_id):
  egg_table = dynamodb.Table('tf-darshan-easter-table')
  print(f"[AUDIT] [CorrelationID: {correlation_id}] Table: {egg_table.name}")
  return egg_table

def list_products(table, correlation_id):
  if not table:
    print(f"[ERROR] [CorrelationID: {correlation_id}] NO table")
  try:
    res = table.scan()
    print(f"[EVENT] [CorrelationID: {correlation_id}] Easter eggs scanned, found {len(res.get('Items', []))} items")
    return respond(200, res.get('Items', []))
  except Exception as e:
    print(f"[ERROR] [CorrelationID: {correlation_id}] Easter egg scan failed: {str(e)}")
    return respond(500, {"error" : str(e)})
    
def lambda_handler(event, context):
  http_method = event.get('httpMethod', '')
  correlation_id = get_correlation_id(event)
  table = get_table(correlation_id)
  if http_method == "GET":
    return list_products(table, correlation_id)
  return respond(400, {'message': "idk man its wrong"})
# list_products(get_table)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)