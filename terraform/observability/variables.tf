variable "aws_region" {
  type        = string
  default     = "ap-southeast-1"
  description = "The AWS region where resources are deployed"
}

variable "api_gateway_id" {
  type        = string
  description = "The ID of the API Gateway"
}

variable "api_gateway_stage_name" {
  type        = string
  description = "The stage name of the API Gateway"
}

variable "lambda_function_names" {
  type        = list(string)
  description = "List of Lambda function names to configure logs, metrics, and alarms"
}

variable "dynamodb_table_names" {
  type        = list(string)
  description = "List of DynamoDB table names to monitor capacity and throttling"
}

variable "order_lambda_name" {
  type        = string
  description = "The name of the order Lambda function"
}

variable "product_lambda_name" {
  type        = string
  description = "The name of the product Lambda function"
}

variable "bff_lambda_name" {
  type        = string
  description = "The name of the BFF Lambda function"
  default     = "tf-darshan-bff-lambda"
}
