resource "google_cloud_scheduler_job" "new_merits_coordinator" {
  name             = "new-merits-coordinator"
  schedule         = "*/20 * * * *"
  description      = "fetch new merits and apply cleaner transformations"
  time_zone        = "America/Los_Angeles"
  attempt_deadline = "3600s"
  region           = var.cloud_scheduler_region

  retry_config {
    min_backoff_duration = "1s"
    max_retry_duration = "10s"
    max_doublings = 2
    retry_count = 3
  }

  app_engine_http_target {
    http_method = "POST"

    app_engine_routing {
      service  = var.app_engine_service
      version  = var.app_engine_version 
    }

    relative_uri = "/process-new-merits"
  }
}

resource "google_cloud_scheduler_job" "merit_edits_coordinator" {
  name             = "merit-edits-coordinator"
  schedule         = "*/20 * * * *"
  description      = "fetch merit edits and apply cleaner transformations"
  time_zone        = "America/Los_Angeles"
  attempt_deadline = "3600s"
  region           = var.cloud_scheduler_region

  retry_config {
    min_backoff_duration = "1s"
    max_retry_duration = "10s"
    max_doublings = 2
    retry_count = 3
  }

  app_engine_http_target {
    http_method = "POST"

    app_engine_routing {
      service  = var.app_engine_service
      version  = var.app_engine_version 
    }

    relative_uri = "/process-edits"
  }
}