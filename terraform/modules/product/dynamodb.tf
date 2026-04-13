resource "aws_dynamodb_table" "table" {
  name           = "tf-darshan-product-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
