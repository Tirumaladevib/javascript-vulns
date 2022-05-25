variable "project_prefix" {
  type = string
}

variable "location" {
  type = string
}

variable "app_engine_service" {
  type = string
  default = "default"
}

variable "app_engine_version" {
  type = string
  default = "v1"
}
