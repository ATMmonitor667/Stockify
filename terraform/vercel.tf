resource "vercel_project" "stockify" {
  name = "stockify"
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = "Ahmedh27/Stockify"
    sourceless = true
  }
}

data "vercel_project_directory" "stockify" {
  path = ".."
}

resource "vercel_deployment" "stockify" {
  project_id  = vercel_project.stockify.id
  files       = data.vercel_project_directory.stockify.files
  path_prefix = "../frontend"
  production  = true
}

resource "vercel_project_domain" "stockify" {
  project_id = vercel_project.stockify.id
  domain     = "stockify-ahmed.vercel.app"
} 