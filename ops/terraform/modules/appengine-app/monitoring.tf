locals {
  api_uptime_check_name      = "https-api-check"
  frontend_uptime_check_name = "https-frontend-check"
}

data "google_secret_manager_secret_version" "pd_integration_key" {
  secret  = data.terraform_remote_state.infra.outputs.secret_name
  project = var.project_id
}

resource "google_monitoring_notification_channel" "pagerduty" {
  display_name = "Pagerduty Health Check Alerts"
  type = "pagerduty"
  sensitive_labels {
    service_key = data.google_secret_manager_secret_version.pd_integration_key.secret_data
  }
}

resource "google_monitoring_uptime_check_config" "api_uptime_check" {
  display_name = local.api_uptime_check_name
  timeout = "30s"
  period  = "60s" # Note: can't be less than 60s according to tf docs ver 3.74.0

  http_check {
    path = "/api/health"
    port = "443"
    use_ssl = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host = var.frontend_url
    }
  }
}

resource "google_monitoring_uptime_check_config" "frontend_uptime_check" {
  display_name = local.frontend_uptime_check_name
  timeout = "30s"
  period  = "60s" # Note: can't be less than 60s according to tf docs ver 3.74.0

  http_check {
    path = "/"
    port = "443"
    use_ssl = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host = var.frontend_url
    }
  }

  content_matchers {
     content = "Data Cleaning Tool"
     matcher = "CONTAINS_STRING"
   }
}

resource "google_monitoring_alert_policy" "pd_alerting" {
  display_name = "${var.project_name} failure"
  combiner = "OR"

  conditions {
    display_name = "Failure of uptime check ${local.api_uptime_check_name}"
    condition_threshold {

      aggregations {
        alignment_period = "120s"
        per_series_aligner = "ALIGN_NEXT_OLDER"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields = ["resource.label.*"]
      }

      duration = "60s"
      comparison = "COMPARISON_GT"
      filter = <<-EOT
        metric.type="monitoring.googleapis.com/uptime_check/check_passed"
        AND metric.label.check_id="${google_monitoring_uptime_check_config.api_uptime_check.uptime_check_id}"
        AND resource.type="uptime_url"
      EOT
      threshold_value = 1
      trigger {
        count = 1
      }
    }
  }

  conditions {
    display_name = "Failure of uptime check ${local.frontend_uptime_check_name}"
    condition_threshold {

      aggregations {
        alignment_period = "120s"
        per_series_aligner = "ALIGN_NEXT_OLDER"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields = ["resource.label.*"]
      }

      duration = "60s"
      comparison = "COMPARISON_GT"
      filter = <<-EOT
        metric.type="monitoring.googleapis.com/uptime_check/check_passed"
        AND metric.label.check_id="${google_monitoring_uptime_check_config.frontend_uptime_check.uptime_check_id}"
        AND resource.type="uptime_url"
      EOT
      threshold_value = 1
      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.pagerduty.name]
}
