variable "project_name" {
  type = string
}

variable "project_id" {
  type = string
}

variable "app_location" {
  type = string
}

variable "code_dir" {
  type = string
}

variable "app_host_env" {
  type = string
}

variable "node_env" {
  type = string
  default = "staging"
}

variable "domains" {
  type = list(string)
}

variable "frontend_url" {
  type = string
}

variable "merit_api_base_url" {
  type = string
}

variable "sentry_dsn" {
  type = string
}

variable "queue_project_id" {
  type = string
}

variable "queue_zone" {
  type = string
}

variable "queue_name" {
  type = string
}

variable "project_prefix" {
  type = string
}

variable "remote_bucket" {
  type = string
}

variable "remote_bucket_prefix" {
  type = string
}
