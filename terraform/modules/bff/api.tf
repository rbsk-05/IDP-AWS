# --------------------------------------------------
# Resources
# --------------------------------------------------

# /api/shop
resource "aws_api_gateway_resource" "shop" {
  rest_api_id = var.api_id
  parent_id   = var.api_root_resource_id
  path_part   = "shop"
}

# /api/bff
resource "aws_api_gateway_resource" "bff" {
  rest_api_id = var.api_id
  parent_id   = var.api_root_resource_id
  path_part   = "bff"
}

# /api/bff/dashboard
resource "aws_api_gateway_resource" "dashboard" {
  rest_api_id = var.api_id
  parent_id   = aws_api_gateway_resource.bff.id
  path_part   = "dashboard"
}

# --------------------------------------------------
# GET /api/shop
# --------------------------------------------------
resource "aws_api_gateway_method" "shop_get" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.shop.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "shop_get" {
  rest_api_id             = var.api_id
  resource_id             = aws_api_gateway_resource.shop.id
  http_method             = aws_api_gateway_method.shop_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.function.invoke_arn
}

# OPTIONS /api/shop
resource "aws_api_gateway_method" "shop_options" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.shop.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "shop_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.shop.id
  http_method = aws_api_gateway_method.shop_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "shop_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.shop.id
  http_method = aws_api_gateway_method.shop_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "shop_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.shop.id
  http_method = aws_api_gateway_method.shop_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,x-test-suite,X-Test-Suite'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_integration.shop_options]
}

# --------------------------------------------------
# GET /api/bff/dashboard
# --------------------------------------------------
resource "aws_api_gateway_method" "dashboard_get" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.dashboard.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "dashboard_get" {
  rest_api_id             = var.api_id
  resource_id             = aws_api_gateway_resource.dashboard.id
  http_method             = aws_api_gateway_method.dashboard_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.function.invoke_arn
}

# OPTIONS /api/bff/dashboard
resource "aws_api_gateway_method" "dashboard_options" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.dashboard.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "dashboard_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.dashboard.id
  http_method = aws_api_gateway_method.dashboard_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "dashboard_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.dashboard.id
  http_method = aws_api_gateway_method.dashboard_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "dashboard_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.dashboard.id
  http_method = aws_api_gateway_method.dashboard_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,x-test-suite,X-Test-Suite'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_integration.dashboard_options]
}
