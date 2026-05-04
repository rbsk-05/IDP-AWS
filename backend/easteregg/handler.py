import boto3
import logging
import json
import decimal

dynamodb = boto3.resource('dynamodb')

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

def get_table():

  egg_table = dynamodb.Table('tf-darshan-easter-table')
  print(egg_table)
  return egg_table

def list_products(table):

  if not table:
    logging.error("NO table")
  try:
    res = table.scan()
    return respond(200, res.get('Items', []))
  except Exception as e:
    logging.error("ERROR!")
    return respond(500, {"error" : str(e)})
    
def lambda_handler(event, context):
  http_method = event.get('httpMethod', '')
  table = get_table()
  if http_method == "GET":
    return list_products(table)
  return respond(400, {'message': "idk man its wrong"})
# list_products(get_table)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)