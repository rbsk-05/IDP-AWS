resource "aws_dynamodb_table" "table" {
  name           = "tf-darshan-search-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "searchId"

  attribute {
    name = "searchId"
    type = "S"
  }
}
