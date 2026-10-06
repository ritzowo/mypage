variable "cloudflare_api_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare API token."
}

variable "zone_id" {
  type        = string
  description = "Zone ID of ritzu.dev."
}

variable "account_id" {
  type        = string
  description = "Cloudflare account ID."
}
