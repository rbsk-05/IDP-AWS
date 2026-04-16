output "table_name" {
  value = aws_dynamodb_table.table.name
}

output "api_integration_hash" {
  value = sha1(jsonencode([
    aws_api_gateway_resource.resource.id,
    aws_api_gateway_method.get.id,
    aws_api_gateway_integration.get.id,
    aws_api_gateway_method.post.id,
    aws_api_gateway_integration.post.id,
    aws_api_gateway_method.options.id,
    aws_api_gateway_integration.options.id,
    aws_api_gateway_integration_response.options.id,
    aws_api_gateway_resource.resource_id.id,
    aws_api_gateway_method.get_id.id,
    aws_api_gateway_integration.get_id.id,
    aws_api_gateway_method.put_id.id,
    aws_api_gateway_integration.put_id.id,
    aws_api_gateway_method.delete_id.id,
    aws_api_gateway_integration.delete_id.id,
    aws_api_gateway_method.options_id.id,
    aws_api_gateway_integration_response.options_id.id
  ]))
}
