# Stockify Infrastructure

This directory contains Terraform configurations for automating the infrastructure provisioning of Stockify.

## Prerequisites

1. Install Terraform locally (version >= 1.0.0)
2. Set up the following GitHub secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `SUPABASE_ACCESS_TOKEN`: Your Supabase access token (if using Supabase)

## Directory Structure

- `provider.tf`: Configures Vercel and Supabase providers
- `variables.tf`: Defines input variables
- `vercel.tf`: Defines Vercel project resources
- `supabase.tf`: (Optional) Defines Supabase resources

## Usage

The infrastructure is automatically provisioned through GitHub Actions when changes are pushed to the `terraform/` directory.

To apply changes locally:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## GitHub Actions Workflow

The `.github/workflows/terraform.yml` file defines the automation workflow that:
1. Runs on pushes to the `terraform/` directory
2. Performs `terraform fmt`, `init`, and `plan` on all changes
3. Automatically applies changes when pushed to the main branch 