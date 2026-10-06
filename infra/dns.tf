resource "cloudflare_workers_custom_domain" "web" {
  account_id = var.account_id
  zone_id    = var.zone_id
  hostname   = "ritzu.dev"
  service    = "ritzu-web"
}

resource "cloudflare_workers_custom_domain" "api" {
  account_id = var.account_id
  zone_id    = var.zone_id
  hostname   = "api.ritzu.dev"
  service    = "ritzu-api"
}
