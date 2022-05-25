resource "random_id" "suffix" {
  byte_length = 2

  prefix = "${var.project_prefix}-ctq-primary-"
}

resource "google_cloud_tasks_queue" "app" {
  name = random_id.suffix.hex
  location = var.location

  app_engine_routing_override {
    service = var.app_engine_service
    version  = var.app_engine_version
  }

  rate_limits {
    max_concurrent_dispatches = 10
    max_dispatches_per_second = 10
  }

  retry_config {
    max_attempts = 5
    max_retry_duration = "4s"
    max_backoff = "60s"
    min_backoff = "1s"
    max_doublings = 1
  }
}
