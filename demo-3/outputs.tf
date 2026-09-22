output "bucket_name" {
  description = "The S3 bucket created by Terraform."
  value       = aws_s3_bucket.demo.bucket
}

output "bucket_arn" {
  description = "The ARN of the Terraform-managed S3 bucket."
  value       = aws_s3_bucket.demo.arn
}
