resource "aws_cognito_user_pool" "pool" {
  name = "tf-darshan-user-pool"

  password_policy {
    minimum_length    = 6
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "tf-darshan-user-pool-client"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}

resource "aws_api_gateway_authorizer" "cognito" {
  name          = "tf-darshan-cognito-authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = var.api_id
  provider_arns = [aws_cognito_user_pool.pool.arn]
}
