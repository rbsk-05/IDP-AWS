resource "aws_sns_topic" "topic" {
  name = "tf-darshan-order-topic"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.topic.arn
  protocol  = "email"
  endpoint  = "darshan.m@idp.com"
}

output "topic_arn" {
  value = aws_sns_topic.topic.arn
}
