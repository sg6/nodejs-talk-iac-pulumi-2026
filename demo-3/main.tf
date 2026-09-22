terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0, < 7.0"
    }
  }
}

provider "aws" {}

resource "aws_s3_bucket" "demo" {
  bucket = "${var.base_bucket_name}-tf"

  tags = {
    Demo      = "demo-3"
    ManagedBy = "Terraform"
  }
}
