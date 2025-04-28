variable "vercel_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Name of the Vercel project"
  type        = string
  default     = "stockify"
}

variable "framework" {
  description = "Framework used for the project"
  type        = string
  default     = "nextjs"
}

variable "git_repository" {
  description = "Git repository URL"
  type        = string
  default     = "https://github.com/Ahmedh27/Stockify"
} 