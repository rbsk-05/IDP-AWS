output "api_integration_hash" {
  value = sha1(jsonencode([
    aws_api_gateway_resource.analytics.id,
    aws_api_gateway_resource.revenue.id,
    aws_api_gateway_method.revenue_get.id,
    aws_api_gateway_integration.revenue_get.id,
    aws_api_gateway_method.revenue_options.id,
    aws_api_gateway_integration.revenue_options.id,
    aws_api_gateway_integration_response.revenue_options.id
  ]))
}
