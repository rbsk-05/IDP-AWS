resource "aws_iam_role" "sns_firehose" {
  name = "tf-darshan-analytics-sns-firehose-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "sns_firehose" {
  name = "tf-darshan-analytics-sns-firehose-policy"
  role = aws_iam_role.sns_firehose.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "firehose:PutRecord"
      Resource = aws_kinesis_firehose_delivery_stream.analytics.arn
    }]
  })
}

resource "aws_sns_topic_subscription" "firehose" {
  topic_arn             = var.sns_topic_arn
  protocol              = "firehose"
  endpoint              = aws_kinesis_firehose_delivery_stream.analytics.arn
  subscription_role_arn = aws_iam_role.sns_firehose.arn
  raw_message_delivery  = true
}
