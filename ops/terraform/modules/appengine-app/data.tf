data "terraform_remote_state" "infra" {
  backend = "gcs"

  config = {
    bucket = var.remote_bucket
    prefix = var.remote_bucket_prefix
  }
}
