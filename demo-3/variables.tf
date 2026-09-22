variable "base_bucket_name" {
  description = "Globally unique lowercase base used for the demo bucket name."
  type        = string

  validation {
    condition = (
      length(var.base_bucket_name) >= 3 &&
      length(var.base_bucket_name) <= 55 &&
      can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.base_bucket_name))
    )
    error_message = "base_bucket_name must be 3-55 characters of lowercase letters, numbers, dots, or hyphens."
  }
}
