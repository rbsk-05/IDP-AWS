# Explicit CloudWatch Log Groups for Lambda functions (prevents resource leaks, configures retention)
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each          = toset(var.lambda_function_names)
  name              = "/aws/lambda/${each.value}"
  retention_in_days = 7
}

# CloudWatch Log Group for API Gateway Access Logging
resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/api-gateway/tf-darshan-api-gateway"
  retention_in_days = 7
}

# 1. Custom Metric Filter: Lambda Errors (captures tracebacks/exceptions from log contents)
resource "aws_cloudwatch_log_metric_filter" "lambda_errors" {
  for_each       = toset(var.lambda_function_names)
  name           = "${each.value}-error-filter"
  pattern        = "?ERROR ?Exception ?Traceback ?fail"
  log_group_name = aws_cloudwatch_log_group.lambda_logs[each.key].name

  metric_transformation {
    name      = "LambdaErrorCount-${each.value}"
    namespace = "EcommerceObservability"
    value     = "1"
  }
}

# 2. Custom Metric Filter: API Gateway 4XX Errors (parsed from access logs JSON schema)
resource "aws_cloudwatch_log_metric_filter" "apigw_4xx" {
  name           = "api-gateway-4xx-errors"
  pattern        = "{ $.status = 4* }"
  log_group_name = aws_cloudwatch_log_group.api_gw.name

  metric_transformation {
    name      = "Api4xxCount"
    namespace = "EcommerceObservability"
    value     = "1"
  }
}

# 3. Custom Metric Filter: API Gateway 5XX Errors (parsed from access logs JSON schema)
resource "aws_cloudwatch_log_metric_filter" "apigw_5xx" {
  name           = "api-gateway-5xx-errors"
  pattern        = "{ $.status = 5* }"
  log_group_name = aws_cloudwatch_log_group.api_gw.name

  metric_transformation {
    name      = "Api5xxCount"
    namespace = "EcommerceObservability"
    value     = "1"
  }
}

# 4. Custom Metric Filter: Product Creation Events
resource "aws_cloudwatch_log_metric_filter" "product_created" {
  name           = "product-created-events"
  pattern        = "\"Product created\""
  log_group_name = "/aws/lambda/${var.product_lambda_name}"

  metric_transformation {
    name      = "ProductCreatedCount"
    namespace = "EcommerceObservability"
    value     = "1"
  }

  depends_on = [aws_cloudwatch_log_group.lambda_logs]
}

# 5. Custom Metric Filter: Product Deletion Events
resource "aws_cloudwatch_log_metric_filter" "product_deleted" {
  name           = "product-deleted-events"
  pattern        = "\"Product deleted\""
  log_group_name = "/aws/lambda/${var.product_lambda_name}"

  metric_transformation {
    name      = "ProductDeletedCount"
    namespace = "EcommerceObservability"
    value     = "1"
  }

  depends_on = [aws_cloudwatch_log_group.lambda_logs]
}

# 6. Custom Metric Filter: Order Placement Failures
resource "aws_cloudwatch_log_metric_filter" "order_failure" {
  name           = "order-placement-failures"
  pattern        = "\"Order placement failed\""
  log_group_name = "/aws/lambda/${var.order_lambda_name}"

  metric_transformation {
    name      = "OrderPlacementFailureCount"
    namespace = "EcommerceObservability"
    value     = "1"
  }

  depends_on = [aws_cloudwatch_log_group.lambda_logs]
}

# 7. Custom Metric Filter: BFF Cache Hits
resource "aws_cloudwatch_log_metric_filter" "bff_cache_hit" {
  name           = "bff-cache-hits"
  pattern        = "\"[METRIC]\" \"CacheHit=1\""
  log_group_name = "/aws/lambda/${var.bff_lambda_name}"

  metric_transformation {
    name      = "BFFCacheHitCount"
    namespace = "EcommerceObservability"
    value     = "1"
  }

  depends_on = [aws_cloudwatch_log_group.lambda_logs]
}

# 8. Custom Metric Filter: BFF Cache Misses
resource "aws_cloudwatch_log_metric_filter" "bff_cache_miss" {
  name           = "bff-cache-misses"
  pattern        = "\"[METRIC]\" \"CacheMiss=1\""
  log_group_name = "/aws/lambda/${var.bff_lambda_name}"

  metric_transformation {
    name      = "BFFCacheMissCount"
    namespace = "EcommerceObservability"
    value     = "1"
  }

  depends_on = [aws_cloudwatch_log_group.lambda_logs]
}

# Comprehensive E-Commerce Observability Dashboard
resource "aws_cloudwatch_dashboard" "ecommerce_dashboard" {
  dashboard_name = "darshan-Ecommerce-Observability-Dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # ROW 1: API Gateway Vitals
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiName", "tf-darshan-api-gateway", "Stage", var.api_gateway_stage_name]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Total API Requests"
          stat    = "Sum"
          period  = 60
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 0
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Latency", "ApiName", "tf-darshan-api-gateway", "Stage", var.api_gateway_stage_name, { "stat" : "Average", "label" : "Avg Latency" }],
            ["AWS/ApiGateway", "Latency", "ApiName", "tf-darshan-api-gateway", "Stage", var.api_gateway_stage_name, { "stat" : "p95", "label" : "p95 Latency" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "API Gateway Latency"
          period  = 60
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 0
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "4XXError", "ApiName", "tf-darshan-api-gateway", "Stage", var.api_gateway_stage_name, { "label" : "4XX Errors" }],
            ["AWS/ApiGateway", "5XXError", "ApiName", "tf-darshan-api-gateway", "Stage", var.api_gateway_stage_name, { "label" : "5XX Errors" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "API Gateway HTTP Errors"
          stat    = "Sum"
          period  = 60
        }
      },

      # ROW 2: Lambda Health Metrics
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 8
        height = 6
        properties = {
          metrics = [
            for func in var.lambda_function_names :
            ["AWS/Lambda", "Invocations", "FunctionName", func, { "label" : func }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Invocations"
          stat    = "Sum"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 6
        width  = 8
        height = 6
        properties = {
          metrics = [
            for func in var.lambda_function_names :
            ["AWS/Lambda", "Errors", "FunctionName", func, { "label" : func }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Exec Errors"
          stat    = "Sum"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 6
        width  = 8
        height = 6
        properties = {
          metrics = [
            for func in var.lambda_function_names :
            ["AWS/Lambda", "Duration", "FunctionName", func, { "stat" : "Average", "label" : "${func} (Avg)" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Average Duration"
          period  = 300
        }
      },

      # ROW 3: DynamoDB Capacity and Throttling
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          metrics = concat(
            [
              for table in var.dynamodb_table_names :
              ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", table, { "stat" : "Sum", "label" : "${table} Consumed Read" }]
            ],
            [
              for table in var.dynamodb_table_names :
              ["AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", table, { "stat" : "Sum", "label" : "${table} Consumed Write" }]
            ]
          )
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "DynamoDB Consumed Capacity Units"
          period  = 60
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 12
        width  = 12
        height = 6
        properties = {
          metrics = concat(
            [
              for table in var.dynamodb_table_names :
              ["AWS/DynamoDB", "ReadThrottleEvents", "TableName", table, { "stat" : "Sum", "label" : "${table} Read Throttle" }]
            ],
            [
              for table in var.dynamodb_table_names :
              ["AWS/DynamoDB", "WriteThrottleEvents", "TableName", table, { "stat" : "Sum", "label" : "${table} Write Throttle" }]
            ]
          )
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "DynamoDB Throttling Events"
          period  = 60
        }
      },

      # ROW 4: Custom Business and Failure Events
      {
        type   = "metric"
        x      = 0
        y      = 18
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["EcommerceObservability", "ProductCreatedCount", { "label" : "Products Created" }],
            ["EcommerceObservability", "ProductDeletedCount", { "label" : "Products Deleted" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Product Operations Summary"
          stat    = "Sum"
          period  = 60
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 18
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["EcommerceObservability", "OrderPlacementFailureCount", { "label" : "Order Failures" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Order Placement Failures"
          stat    = "Sum"
          period  = 60
        }
      },
      # ROW 5: BFF Caching Performance
      {
        type   = "metric"
        x      = 0
        y      = 24
        width  = 24
        height = 6
        properties = {
          metrics = [
            ["EcommerceObservability", "BFFCacheHitCount", { "label" : "Cache Hits" }],
            ["EcommerceObservability", "BFFCacheMissCount", { "label" : "Cache Misses" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "BFF Cache Performance"
          stat    = "Sum"
          period  = 60
        }
      }
    ]
  })
}
