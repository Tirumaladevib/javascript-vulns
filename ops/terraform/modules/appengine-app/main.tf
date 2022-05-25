resource "google_app_engine_application" "appengine" {
  location_id = var.app_location
}

resource "google_compute_global_address" "app" {
  name         = "global-ip"
  address_type = "EXTERNAL"
}

resource "google_compute_global_forwarding_rule" "app" {
  name       = "globalrule"
  ip_address = google_compute_global_address.app.id
  target     = google_compute_target_https_proxy.app.id
  port_range = "443"
}

resource "google_compute_target_https_proxy" "app" {
  name             = "app"
  url_map          = google_compute_url_map.app.id
  ssl_certificates = [google_compute_managed_ssl_certificate.app.id]
}

resource "google_compute_managed_ssl_certificate" "app" {
  name = "app"

  managed {
    domains = var.domains
  }
}

resource "google_compute_url_map" "app" {
  name = "app"

  default_service = google_compute_backend_bucket.frontend.id

  host_rule {
    hosts        = var.domains
    path_matcher = "app"
  }

  path_matcher {
    name            = "app"
    default_service = google_compute_backend_bucket.frontend.id

    route_rules {
      priority = 1
      service  = google_compute_backend_service.appengine_neg["default"].id
      match_rules {
        prefix_match = "/api"
      }
    }

    route_rules {
      priority = 2
      service  = google_compute_backend_bucket.frontend.id
      match_rules {
        prefix_match = "/"
      }
    }
  }
}

# HTTP Redirect to the HTTPS service:
resource "google_compute_target_http_proxy" "https_redir" {
  name    = "https-redirect-proxy"
  url_map = google_compute_url_map.redirect_to_https.id
}

resource "google_compute_url_map" "redirect_to_https" {
  name            = "https-redirect-map"
  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_global_forwarding_rule" "redirect" {
  name       = "redirect-rule"
  ip_address = google_compute_global_address.app.id
  target     = google_compute_target_http_proxy.https_redir.id
  port_range = "80"
}

resource "google_compute_backend_bucket" "frontend" {
  name        = "frontend-bucket"
  bucket_name = google_storage_bucket.frontend.name
  enable_cdn  = false
}

resource "google_storage_bucket" "frontend" {
  name     = "${var.project_name}-sbu-us-frontend"
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

resource "google_storage_bucket_iam_member" "gcs_frontend_access" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

data "google_app_engine_default_service_account" "default" {
}

resource "google_project_iam_member" "appengine_neg" {
  for_each = toset([
    "roles/iam.serviceAccountTokenCreator",
    "roles/secretmanager.secretAccessor",
    "roles/cloudsql.client",
  ])

  role = each.key
  member = "serviceAccount:${data.google_app_engine_default_service_account.default.email}"
}

locals {
  services = {
    default    = "npm run start:api"
    subscriber = "npm run start:cloudtask"
  }
}

resource "google_compute_backend_service" "appengine_neg" {
  for_each = local.services

  load_balancing_scheme = "EXTERNAL"
  backend {
    group = google_compute_region_network_endpoint_group.appengine_neg[each.key].id
  }

  name     = "appengine-service-${each.key}"
  protocol = "HTTP"
}

resource "google_compute_region_network_endpoint_group" "appengine_neg" {
  for_each = local.services

  name                  = "appengine-neg-${each.key}"
  network_endpoint_type = "SERVERLESS"
  region                = "us-central1"
  app_engine {
    service = google_app_engine_standard_app_version.appengine_neg[each.key].service
    version = google_app_engine_standard_app_version.appengine_neg[each.key].version_id
  }
}

resource "google_app_engine_standard_app_version" "appengine_neg" {
  for_each = local.services

  version_id = "v1"
  service    = each.key
  runtime    = "nodejs14"

  entrypoint {
    shell = each.value
  }

  deployment {
    zip {
      source_url = "https://storage.googleapis.com/${google_storage_bucket.appengine_neg.name}/${google_storage_bucket_object.appengine_neg.name}"
    }
  }

  env_variables = {
    NODE_ENV             = var.node_env
    APP_HOST_ENV         = var.app_host_env
    MERIT_BASE_URL       = var.merit_api_base_url
    FRONT_END_URL        = var.frontend_url
    SENTRY_DSN           = var.sentry_dsn

    CLOUD_TASK_QUEUE_PROJECT_ID       = var.queue_project_id
    CLOUD_TASK_QUEUE_ZONE             = var.queue_zone
    CLOUD_TASK_QUEUE                  = var.queue_name

    # secret names env
    APP_ID                              = data.google_secret_manager_secret_version.app_id.secret_data
    APP_ORG_ID                          = data.google_secret_manager_secret_version.app_org_id.secret_data
    APP_SECRET                          = data.google_secret_manager_secret_version.app_secret.secret_data
    COOKIE_SECRET_KEY                   = data.google_secret_manager_secret_version.cookie_secret.secret_data
    COOKIE_NAME                         = data.google_secret_manager_secret_version.cookie_name.secret_data
    JWT_SECRET_KEY                      = data.google_secret_manager_secret_version.jwt_secret.secret_data
    POSTGRES_HOST                       = data.google_secret_manager_secret_version.postgres_host.secret_data
    POSTGRES_PORT                       = data.google_secret_manager_secret_version.postgres_port.secret_data
    POSTGRES_DB                         = data.google_secret_manager_secret_version.postgres_db_name.secret_data
    POSTGRES_USERNAME                   = data.google_secret_manager_secret_version.postgres_user.secret_data
    POSTGRES_PASSWORD                   = data.google_secret_manager_secret_version.postgres_password.secret_data
  }

  automatic_scaling {
    max_concurrent_requests = 10
    min_idle_instances = 1
    max_idle_instances = 3

    standard_scheduler_settings {
      min_instances = 1
    }
  }

  timeouts {
    create = "10m"
    update = "10m"
    delete = "10m"
  }

  instance_class = "F4"
}

resource "google_storage_bucket" "appengine_neg" {
  name = "${var.project_name}-sbu-us-appengine-code"

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      num_newer_versions = 1
    }
  }
}

resource "google_storage_bucket_object" "appengine_neg" {
  name   = "app-${data.archive_file.app.output_md5}.zip"
  bucket = google_storage_bucket.appengine_neg.name
  source = data.archive_file.app.output_path
}

data "archive_file" "app" {
  type        = "zip"
  source_dir  = var.code_dir
  output_path = "${path.module}/out/app.zip"
}

data "google_secret_manager_secret_version" "app_id" {
  secret = "${var.project_prefix}-sms-app-id"
  project = var.project_id
  }

data "google_secret_manager_secret_version" "app_org_id" {
  secret = "${var.project_prefix}-sms-app-org-id"
  project = var.project_id
}

data "google_secret_manager_secret_version" "app_secret" {
  secret = "${var.project_prefix}-sms-app-secret"
  project = var.project_id
}

data "google_secret_manager_secret_version" "cookie_secret" {
  secret = "${var.project_prefix}-sms-cookie"
  project = var.project_id
}

data "google_secret_manager_secret_version" "cookie_name" {
  secret = "${var.project_prefix}-sms-cookie-name"
  project = var.project_id
}

data "google_secret_manager_secret_version" "jwt_secret" {
  secret = "${var.project_prefix}-sms-jwt-secret"
  project = var.project_id
}

data "google_secret_manager_secret_version" "postgres_user" {
  secret = "${var.project_prefix}-sms-postgres-username"
  project = var.project_id
}

data "google_secret_manager_secret_version" "postgres_password" {
  secret = "${var.project_prefix}-sms-postgres-password"
  project = var.project_id
}

data "google_secret_manager_secret_version" "postgres_host" {
  secret = "${var.project_prefix}-sms-postgres-host"
  project = var.project_id
}

data "google_secret_manager_secret_version" "postgres_port" {
  secret = "${var.project_prefix}-sms-postgres-port"
  project = var.project_id
}

data "google_secret_manager_secret_version" "postgres_db_name" {
  secret = "${var.project_prefix}-sms-postgres-db_name"
  project = var.project_id
}
