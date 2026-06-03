data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/easteregg/handler.py"
  output_path = "${path.module}/lambda.zip"
}

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

resource "aws_iam_role_policy_attachment" "easter_lambda_logs" {
  role       = aws_iam_role.easter_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "easter_lambda_xray" {
  role       = aws_iam_role.easter_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess"
}

resource "aws_lambda_function" "easter_lambda" {
  function_name = "tf-darshan-easter-lambda"
  role          = aws_iam_role.easter_lambda_role.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.12"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }
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