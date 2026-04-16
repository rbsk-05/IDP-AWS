resource "aws_dynamodb_table" "test_product_table" {
  name           = "test-darshan-product-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "test_cart_table" {
  name           = "test-darshan-cart-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "test_search_table" {
  name           = "test-darshan-search-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "searchId"

  attribute {
    name = "searchId"
    type = "S"
  }
}
