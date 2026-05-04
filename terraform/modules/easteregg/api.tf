resource "aws_api_gateway_resource" "easter" {
  rest_api_id = var.api_id
  parent_id = var.api_root_resource_id
  path_part = "easter"
}

resource "aws_api_gateway_method" "get_easter" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.easter.id
  http_method = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_easter" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.easter.id
  http_method = aws_api_gateway_method.get_easter.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.easter_lambda.invoke_arn
}

resource "aws_api_gateway_method" "options_easter" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.easter.id
  http_method = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_easter" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.easter.id
  http_method = aws_api_gateway_method.options_easter.http_method
  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\" : 200}"
  }
}

resource "aws_api_gateway_method_response" "options_easter" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.easter.id
  http_method = aws_api_gateway_method.options_easter.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "options_easter" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.easter.id
  http_method = aws_api_gateway_method.options_easter.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type, Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.options_easter]
}