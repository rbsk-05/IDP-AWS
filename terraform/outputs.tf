output "api_gateway_url" {
  description = "Base URL of the API Gateway"
  value       = aws_api_gateway_stage.prod.invoke_url
}

output "cloudfront_url" {
  description = "CloudFront Distribution URL"
  value       = module.cloudfront.distribution_domain_name
}

output "product_table_name" {
  value = module.product.table_name
}

output "cart_table_name" {
  value = module.cart.table_name
}

output "search_table_name" {
  value = module.search.table_name
}
