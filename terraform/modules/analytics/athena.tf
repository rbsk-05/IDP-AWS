resource "aws_glue_catalog_database" "analytics" {
  name = "darshan_ecommerce_analytics"
}

resource "aws_glue_catalog_table" "analytics_orders" {
  name          = "orders_analytics"
  database_name = aws_glue_catalog_database.analytics.name
  table_type    = "EXTERNAL_TABLE"

  parameters = {
    "classification" = "json"
  }

  storage_descriptor {
    location      = "s3://${aws_s3_bucket.analytics.bucket}/raw/"
    input_format  = "org.apache.hadoop.mapred.TextInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"

    ser_de_info {
      serialization_library = "org.openx.data.jsonserde.JsonSerDe"
      parameters = {
        "paths" = "id,userId,items,total,status,createdAt"
      }
    }

    columns {
      name = "id"
      type = "string"
    }

    columns {
      name = "userId"
      type = "string"
    }

    columns {
      name = "total"
      type = "double"
    }

    columns {
      name = "status"
      type = "string"
    }

    columns {
      name = "createdAt"
      type = "string"
    }

    columns {
      name = "items"
      type = "string"
    }
  }

  partition_keys {
    name = "year"
    type = "string"
  }

  partition_keys {
    name = "month"
    type = "string"
  }

  partition_keys {
    name = "day"
    type = "string"
  }
}

resource "aws_athena_workgroup" "analytics" {
  name          = "darshan_analytics_workgroup"
  force_destroy = true

  configuration {
    enforce_workgroup_configuration    = true
    publish_cloudwatch_metrics_enabled = true

    result_configuration {
      output_location = "s3://${aws_s3_bucket.analytics.bucket}/athena-results/"
    }
  }
}

output "athena_workgroup_name" {
  value = aws_athena_workgroup.analytics.name
}

output "glue_database_name" {
  value = aws_glue_catalog_database.analytics.name
}

output "glue_table_name" {
  value = aws_glue_catalog_table.analytics_orders.name
}
