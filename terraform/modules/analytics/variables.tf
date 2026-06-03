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

variable "sns_topic_arn" {
  description = "The ARN of the SNS order topic to stream events from"
  type        = string
}
