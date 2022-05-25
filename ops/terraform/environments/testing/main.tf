resource "google_storage_bucket" "frontend" {
  name     = "enlume-sbu-us-frontend"
  location = "US"

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      num_newer_versions = 1
    }
  }
}
