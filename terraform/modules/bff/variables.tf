variable "api_id" {
  description = "The REST API ID of the API Gateway"
  type        = string
}

variable "api_root_resource_id" {
  description = "The /api resource ID"
  type        = string
}

variable "api_execution_arn" {
  description = "The execution ARN of the API Gateway"
  type        = string
}

variable "product_lambda_arn" {
  description = "The ARN of the Product Lambda function"
  type        = string
}

variable "product_lambda_name" {
  description = "The name of the Product Lambda function"
  type        = string
}

variable "cart_lambda_arn" {
  description = "The ARN of the Cart Lambda function"
  type        = string
}

variable "cart_lambda_name" {
  description = "The name of the Cart Lambda function"
  type        = string
}

variable "order_lambda_arn" {
  description = "The ARN of the Order Lambda function"
  type        = string
}

variable "order_lambda_name" {
  description = "The name of the Order Lambda function"
  type        = string
}

variable "cache_ttl" {
  description = "Cache TTL in seconds for product listings in the BFF"
  type        = number
  default     = 10
}
