resource "aws_api_gateway_resource" "resource" {
  rest_api_id = var.api_id
  parent_id   = var.api_root_resource_id
  path_part   = "products"
}

# -------------------
# OPTIONS /products (CORS preflight)
# -------------------
resource "aws_api_gateway_method" "options" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_integration.options]
}

# -------------------
# GET /products
# -------------------
resource "aws_api_gateway_method" "get" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get" {
  rest_api_id             = var.api_id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.function.invoke_arn
}

# -------------------
# POST /products
# -------------------
resource "aws_api_gateway_method" "post" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post" {
  rest_api_id             = var.api_id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.function.invoke_arn
}

# -------------------
# GET /products/{id}
# -------------------
resource "aws_api_gateway_resource" "resource_id" {
  rest_api_id = var.api_id
  parent_id   = aws_api_gateway_resource.resource.id
  path_part   = "{id}"
}

resource "aws_api_gateway_method" "get_id" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.resource_id.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_id" {
  rest_api_id             = var.api_id
  resource_id             = aws_api_gateway_resource.resource_id.id
  http_method             = aws_api_gateway_method.get_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.function.invoke_arn
}

# OPTIONS /products/{id}
resource "aws_api_gateway_method" "options_id" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.resource_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_id" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.resource_id.id
  http_method = aws_api_gateway_method.options_id.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_id" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.resource_id.id
  http_method = aws_api_gateway_method.options_id.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_id" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.resource_id.id
  http_method = aws_api_gateway_method.options_id.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_integration.options_id]
}


