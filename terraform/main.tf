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
      timestamp()
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    module.product,
    module.cart,
    module.search
  ]
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "prod"
}

module "product" {
  source = "./modules/product"
  api_id = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn = aws_api_gateway_rest_api.main.execution_arn
}

module "cart" {
  source = "./modules/cart"
  api_id = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn = aws_api_gateway_rest_api.main.execution_arn
}

module "search" {
  source = "./modules/search"
  api_id = aws_api_gateway_rest_api.main.id
  api_root_resource_id = aws_api_gateway_resource.api.id
  api_execution_arn = aws_api_gateway_rest_api.main.execution_arn
}

module "frontend" {
  source = "./modules/frontend"
}

module "cloudfront" {
  source = "./modules/cloudfront"
  api_endpoint = "${aws_api_gateway_rest_api.main.id}.execute-api.ap-southeast-1.amazonaws.com"
  stage_name = aws_api_gateway_stage.prod.stage_name
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
