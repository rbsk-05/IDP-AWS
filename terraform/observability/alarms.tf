# 1. Lambda Errors Alarm: Triggered if any function has > 5 errors in 5 minutes
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each            = toset(var.lambda_function_names)
  alarm_name          = "${each.value}-high-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alarm if ${each.value} error count exceeds 5 inside 5 minutes"
  actions_enabled     = false

  dimensions = {
    FunctionName = each.value
  }
}

# 2. API Gateway 5XX Errors Alarm: Triggered if > 2 errors occur in 1 minute
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "api-gateway-high-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 60 # 1 minute
  statistic           = "Sum"
  threshold           = 2
  alarm_description   = "Alarm if API Gateway 5XX errors exceed 2 in 1 minute"
  actions_enabled     = false

  dimensions = {
    ApiName = "tf-darshan-api-gateway"
    Stage   = var.api_gateway_stage_name
  }
}

# 3. Lambda Latency Alarm: Triggered if the average function execution takes > 3 seconds (3000ms) in 5 minutes
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  for_each            = toset(var.lambda_function_names)
  alarm_name          = "${each.value}-high-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = 3000 # 3 seconds (in milliseconds)
  alarm_description   = "Alarm if average execution duration of ${each.value} exceeds 3 seconds"
  actions_enabled     = false

  dimensions = {
    FunctionName = each.value
  }
}

# 4. DynamoDB Read Throttling Alarm: Triggered if any table experiences read throttling events
resource "aws_cloudwatch_metric_alarm" "dynamodb_read_throttling" {
  for_each            = toset(var.dynamodb_table_names)
  alarm_name          = "dynamodb-${each.value}-read-throttling"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ReadThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = 60 # 1 minute
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Alarm if DynamoDB read throttling events occur on table ${each.value}"
  actions_enabled     = false

  dimensions = {
    TableName = each.value
  }
}

# 5. DynamoDB Write Throttling Alarm: Triggered if any table experiences write throttling events
resource "aws_cloudwatch_metric_alarm" "dynamodb_write_throttling" {
  for_each            = toset(var.dynamodb_table_names)
  alarm_name          = "dynamodb-${each.value}-write-throttling"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "WriteThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = 60 # 1 minute
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Alarm if DynamoDB write throttling events occur on table ${each.value}"
  actions_enabled     = false

  dimensions = {
    TableName = each.value
  }
}
