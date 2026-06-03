output "api_integration_hash" {
  value = sha1(jsonencode([
    aws_api_gateway_resource.shop.id,
    aws_api_gateway_method.shop_get.id,
    aws_api_gateway_integration.shop_get.id,
    aws_api_gateway_method.shop_options.id,
    aws_api_gateway_integration.shop_options.id,
    aws_api_gateway_integration_response.shop_options.id,
    aws_api_gateway_resource.bff.id,
    aws_api_gateway_resource.dashboard.id,
    aws_api_gateway_method.dashboard_get.id,
    aws_api_gateway_integration.dashboard_get.id,
    aws_api_gateway_method.dashboard_options.id,
    aws_api_gateway_integration.dashboard_options.id,
    aws_api_gateway_integration_response.dashboard_options.id
  ]))
}
