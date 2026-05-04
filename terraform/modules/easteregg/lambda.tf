resource "aws_iam_role" "easter_lambda_role" {
  name = "tf-darshan-easter-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_lambda_function" "easter_lambda" {
  function_name = "tf-darshan-easter-lambda"
  role          = aws_iam_role.easter_lambda_role.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.12"

  filename         = "${path.module}/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda.zip")
}

resource "aws_lambda_permission" "apigw_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.easter_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.api_execution_arn}/*/*"
}

resource "aws_iam_role_policy" "easter_dynamodb_policy" {
  name = "tf-darshan-easter-dynamodb-policy"
  role = aws_iam_role.easter_lambda_role.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:Scan"
        ],
        Resource = "arn:aws:dynamodb:ap-southeast-1:*:table/tf-darshan-easter-table"
      }
    ]
  })
}