# --------------------------------------------------
# Resources
# --------------------------------------------------

# /api/analytics
resource "aws_api_gateway_resource" "analytics" {
  rest_api_id = var.api_id
  parent_id   = var.api_root_resource_id
  path_part   = "analytics"
}

# /api/analytics/revenue
resource "aws_api_gateway_resource" "revenue" {
  rest_api_id = var.api_id
  parent_id   = aws_api_gateway_resource.analytics.id
  path_part   = "revenue"
}

# --------------------------------------------------
# GET /api/analytics/revenue
# --------------------------------------------------
resource "aws_api_gateway_method" "revenue_get" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.revenue.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "revenue_get" {
  rest_api_id             = var.api_id
  resource_id             = aws_api_gateway_resource.revenue.id
  http_method             = aws_api_gateway_method.revenue_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.function.invoke_arn
}

# OPTIONS /api/analytics/revenue
resource "aws_api_gateway_method" "revenue_options" {
  rest_api_id   = var.api_id
  resource_id   = aws_api_gateway_resource.revenue.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "revenue_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.revenue.id
  http_method = aws_api_gateway_method.revenue_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "revenue_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.revenue.id
  http_method = aws_api_gateway_method.revenue_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "revenue_options" {
  rest_api_id = var.api_id
  resource_id = aws_api_gateway_resource.revenue.id
  http_method = aws_api_gateway_method.revenue_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,x-test-suite,X-Test-Suite'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_integration.revenue_options]
}
