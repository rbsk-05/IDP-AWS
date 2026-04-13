resource "aws_dynamodb_table" "table" {
  name           = "tf-darshan-cart-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}
