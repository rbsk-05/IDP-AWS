# AWS X-Ray Group for visual trace analysis
resource "aws_xray_group" "ecommerce" {
  group_name        = "EcommerceApplication"
  filter_expression = "service(\"tf-darshan-*\")"
}

# AWS X-Ray Sampling Rule: defines rules for tracing a portion of api requests
resource "aws_xray_sampling_rule" "standard" {
  rule_name      = "EcommerceStandardRule"
  priority       = 1000
  version        = 1
  reservoir_size = 5
  fixed_rate     = 0.05
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_name   = "*"
  service_type   = "*"
  resource_arn   = "*"
}
