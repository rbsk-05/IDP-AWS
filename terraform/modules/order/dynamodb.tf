resource "aws_dynamodb_table" "table" {
  name           = "tf-darshan-order-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "orderId"
  range_key      = "userId"

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "test_table" {
  name           = "test-darshan-order-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "orderId"
  range_key      = "userId"

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }
}

output "table_name" {
  value = aws_dynamodb_table.table.name
}
