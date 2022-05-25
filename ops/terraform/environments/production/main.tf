terraform {
  backend "gcs" {
    bucket = "mrt-datacleaner-p-sbu-terraform-state"
    prefix = "terraform/state"
  }
}

locals {
  project_id = "${local.project_prefix}-f6a4"
  project_prefix = "mrt-datacleaner-p"
  app_location = "us-central"
  cloud_tasks_location = "us-central1"
}

provider "google" {
  project = "mrt-datacleaner-p-f6a4"
}

locals {
  frontend_url = "dct.merits.com"
  merit_api_base_url = "https://api.merits.com/v2"
  sentry_dsn = "https://13ec71e727fc4db99dd1577eb3a47cb9@o239161.ingest.sentry.io/5938996"
}

module "app" {
  source = "../../modules/appengine-app"

  project_name = local.project_id
  project_id   = local.project_id
  code_dir     = "${path.module}/../../../../server"
  app_location = local.app_location
  app_host_env = "production"
  node_env     = "production"
  project_prefix = local.project_prefix

  queue_project_id = local.project_id
  queue_zone       = local.cloud_tasks_location
  queue_name       = module.cloud_tasks_queue.queue_name

  frontend_url       = local.frontend_url
  merit_api_base_url = local.merit_api_base_url
  sentry_dsn         = local.sentry_dsn

  domains = [local.frontend_url]
  remote_bucket        = "${local.project_prefix}-sbu-terraform-state"
  remote_bucket_prefix = "terraform/state/data"

}

module "cloud_tasks_queue" {
  source = "../../modules/cloud-task-queue"

  project_prefix = local.project_prefix
  location = local.cloud_tasks_location

  app_engine_service = "subscriber"
}

module "cloud_scheduler" {
  source = "../../modules/cloud-scheduler"

  cloud_scheduler_region = local.cloud_tasks_location
  app_engine_service = "subscriber"
}
