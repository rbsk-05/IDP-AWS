output "table_name" {
  value = aws_dynamodb_table.table.name
}

output "api_integration_hash" {
  value = sha1(jsonencode([
    aws_api_gateway_resource.resource.id,
    aws_api_gateway_method.get.id,
    aws_api_gateway_integration.get.id,
    aws_api_gateway_method.options.id,
    aws_api_gateway_integration.options.id,
    aws_api_gateway_integration_response.options.id
  ]))
}
