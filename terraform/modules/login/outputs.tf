output "user_pool_id" {
  value       = aws_cognito_user_pool.pool.id
  description = "The ID of the Cognito User Pool"
}

output "user_pool_client_id" {
  value       = aws_cognito_user_pool_client.client.id
  description = "The ID of the Cognito User Pool Client"
}

output "authorizer_id" {
  value       = aws_api_gateway_authorizer.cognito.id
  description = "The ID of the Cognito Authorizer"
}

output "users_table_name" {
  value       = aws_dynamodb_table.users.name
  description = "The name of the users DynamoDB table"
}

output "api_integration_hash" {
  value = sha1(jsonencode([
    aws_api_gateway_resource.users.id,
    aws_api_gateway_method.users.id,
    aws_api_gateway_integration.users.id,
    aws_api_gateway_method.users_options.id,
    aws_api_gateway_integration.users_options.id,
    aws_api_gateway_integration_response.users_options.id
  ]))
}
