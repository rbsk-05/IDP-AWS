# 1. API Gateway 5XX Errors Alarm: Triggered if > 2 errors occur in 1 minute
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "darshan-api-gateway-high-5xx-errors"
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

  treat_missing_data = "notBreaching"
}

# 2. Order Placement Failures Alarm: Triggered if any order placement failures are logged
resource "aws_cloudwatch_metric_alarm" "order_failures" {
  alarm_name          = "darshan-order-placement-failures-logged"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "OrderPlacementFailureCount"
  namespace           = "EcommerceObservability"
  period              = 60 # 1 minute
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Alarm if order placement failure events are detected in the logs"
  actions_enabled     = false
  treat_missing_data  = "notBreaching"
}

# 3. Order Lambda Errors Alarm: Triggered if order function has > 5 errors in 5 minutes
resource "aws_cloudwatch_metric_alarm" "order_lambda_errors" {
  alarm_name          = "darshan-order-lambda-high-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alarm if the order Lambda function error count exceeds 5 inside 5 minutes"
  actions_enabled     = false

  dimensions = {
    FunctionName = var.order_lambda_name
  }

  treat_missing_data = "notBreaching"
}

# 4. Order Lambda Duration Alarm: Triggered if average execution takes > 3 seconds (3000ms)
resource "aws_cloudwatch_metric_alarm" "order_lambda_duration" {
  alarm_name          = "darshan-order-lambda-high-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = 3000 # 3 seconds
  alarm_description   = "Alarm if the average execution duration of the order Lambda exceeds 3 seconds"
  actions_enabled     = false

  dimensions = {
    FunctionName = var.order_lambda_name
  }

  treat_missing_data = "notBreaching"
}

# 5. Order Table Write Throttling Alarm: Triggered if the order table experiences write throttling events
resource "aws_cloudwatch_metric_alarm" "order_table_write_throttling" {
  alarm_name          = "darshan-dynamodb-order-table-write-throttling"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "WriteThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = 60 # 1 minute
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Alarm if DynamoDB write throttling events occur on the order table"
  actions_enabled     = false

  dimensions = {
    TableName = "tf-darshan-order-table"
  }

  treat_missing_data = "notBreaching"
}
