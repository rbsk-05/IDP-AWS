resource "aws_api_gateway_rest_api" "main" {
  name        = "tf-darshan-api-gateway"
  description = "API Gateway for IDP Microservices"
}

resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "api"
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      module.product.api_integration_hash,
      module.cart.api_integration_hash,
      module.search.api_integration_hash,
      module.order.api_integration_hash,
      module.login.api_integration_hash,
      timestamp()
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    module.product,
    module.cart,
    module.search,
    module.easter,
    module.login
  ]
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "prod"

  xray_tracing_enabled = true

  access_log_settings {
    destination_arn = module.observability.api_gw_log_group_arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      caller         = "$context.identity.caller"
      user           = "$context.identity.user"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
}

module "product" {
  source               = "./modules/product"
  api_id               = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn    = aws_api_gateway_rest_api.main.execution_arn
}

module "cart" {
  source               = "./modules/cart"
  api_id               = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn    = aws_api_gateway_rest_api.main.execution_arn
}

module "search" {
  source               = "./modules/search"
  api_id               = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn    = aws_api_gateway_rest_api.main.execution_arn
}

module "order" {
  source               = "./modules/order"
  api_id               = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn    = aws_api_gateway_rest_api.main.execution_arn
  product_table_name   = module.product.table_name
}

module "frontend" {
  source = "./modules/frontend"
}

module "cloudfront" {
  source                = "./modules/cloudfront"
  api_endpoint          = "${aws_api_gateway_rest_api.main.id}.execute-api.${var.region}.amazonaws.com"
  stage_name            = aws_api_gateway_stage.prod.stage_name
  s3_bucket_domain_name = module.frontend.bucket_domain_name
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = module.frontend.bucket_id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFront"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "arn:aws:s3:::${module.frontend.bucket_id}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = module.cloudfront.distribution_arn
          }
        }
      }
    ]
  })
}

module "test" {
  source = "./test"
}

module "easter" {
  source = "./modules/easteregg"

  api_id               = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn    = aws_api_gateway_rest_api.main.execution_arn
}

module "observability" {
  source = "./observability"

  aws_region             = var.region
  api_gateway_id         = aws_api_gateway_rest_api.main.id
  api_gateway_stage_name = "prod"

  lambda_function_names = [
    "tf-darshan-product-lambda",
    "tf-darshan-cart-lambda",
    "tf-darshan-search-lambda",
    "tf-darshan-order-lambda",
    "tf-darshan-users-lambda",
    "tf-darshan-easter-lambda"
  ]

  dynamodb_table_names = [
    "tf-darshan-product-table",
    "tf-darshan-cart-table",
    "tf-darshan-search-table",
    "tf-darshan-order-table",
    "tf-darshan-users-table",
    "tf-darshan-easter-table"
  ]

  product_lambda_name = "tf-darshan-product-lambda"
  order_lambda_name   = "tf-darshan-order-lambda"
}

module "login" {
  source               = "./modules/login"
  api_id               = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn    = aws_api_gateway_rest_api.main.execution_arn
}

moved {
  from = aws_cognito_user_pool.pool
  to   = module.login.aws_cognito_user_pool.pool
}

moved {
  from = aws_cognito_user_pool_client.client
  to   = module.login.aws_cognito_user_pool_client.client
}

moved {
  from = aws_api_gateway_authorizer.cognito
  to   = module.login.aws_api_gateway_authorizer.cognito
}

moved {
  from = aws_dynamodb_table.users
  to   = module.login.aws_dynamodb_table.users
}

moved {
  from = aws_dynamodb_table.test_users
  to   = module.login.aws_dynamodb_table.test_users
}

moved {
  from = aws_iam_role.users_lambda
  to   = module.login.aws_iam_role.users_lambda
}

moved {
  from = aws_iam_role_policy_attachment.users_lambda
  to   = module.login.aws_iam_role_policy_attachment.users_lambda
}

moved {
  from = aws_iam_role_policy_attachment.users_xray
  to   = module.login.aws_iam_role_policy_attachment.users_xray
}

moved {
  from = aws_iam_policy.users_dynamodb
  to   = module.login.aws_iam_policy.users_dynamodb
}

moved {
  from = aws_iam_role_policy_attachment.users_dynamodb
  to   = module.login.aws_iam_role_policy_attachment.users_dynamodb
}

moved {
  from = aws_lambda_function.users
  to   = module.login.aws_lambda_function.users
}

moved {
  from = aws_lambda_permission.users
  to   = module.login.aws_lambda_permission.users
}

moved {
  from = aws_api_gateway_resource.users
  to   = module.login.aws_api_gateway_resource.users
}

moved {
  from = aws_api_gateway_method.users
  to   = module.login.aws_api_gateway_method.users
}

moved {
  from = aws_api_gateway_integration.users
  to   = module.login.aws_api_gateway_integration.users
}

moved {
  from = aws_api_gateway_method.users_options
  to   = module.login.aws_api_gateway_method.users_options
}

moved {
  from = aws_api_gateway_integration.users_options
  to   = module.login.aws_api_gateway_integration.users_options
}

moved {
  from = aws_api_gateway_method_response.users_options
  to   = module.login.aws_api_gateway_method_response.users_options
}

moved {
  from = aws_api_gateway_integration_response.users_options
  to   = module.login.aws_api_gateway_integration_response.users_options
}