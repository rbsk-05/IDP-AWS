resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "analytics" {
  bucket        = "tf-darshan-analytics-bucket-${random_id.bucket_suffix.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_ownership_controls" "analytics" {
  bucket = aws_s3_bucket.analytics.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "analytics" {
  depends_on = [aws_s3_bucket_ownership_controls.analytics]

  bucket = aws_s3_bucket.analytics.id
  acl    = "private"
}

output "bucket_name" {
  value = aws_s3_bucket.analytics.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.analytics.arn
}
