terraform {
  required_version = ">= 1.6"

  backend "s3" {
    bucket  = "ritzu-tfstate"
    key     = "portfolio/terraform.tfstate"
    region  = "ap-northeast-1"
    encrypt = true
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}