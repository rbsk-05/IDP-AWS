output "api_gw_log_group_arn" {
  value       = aws_cloudwatch_log_group.api_gw.arn
  description = "The ARN of the CloudWatch Log Group for API Gateway Access Logs"
}

output "dashboard_arn" {
  value       = aws_cloudwatch_dashboard.ecommerce_dashboard.dashboard_arn
  description = "The ARN of the Ecommerce Observability Dashboard"
}

output "xray_group_arn" {
  value       = aws_xray_group.ecommerce.arn
  description = "The ARN of the X-Ray Group"
}
