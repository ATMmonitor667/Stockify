# Stockify

## Backend
This project uses Supabase as the backend service. Supabase provides:
- Authentication
- Database
- Real-time subscriptions
- Storage
- Edge Functions

## Testing Setup

This project uses:
- Frontend: Jest + React Testing Library
- Continuous Integration via GitHub Actions

### Quick Start

```bash
# Frontend Tests
cd frontend
npm test

# Run tests in watch mode
npm run test:watch
```

For detailed testing information, see [TESTING.md](TESTING.md)

# Install the new dependencies
npm install

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

## Infrastructure

This project uses Vercel for infrastructure and deployment. The infrastructure is defined as code in the following files:

- `.vercel/project.json`: Project configuration
- `.vercel/output/config.json`: Deployment configuration
- `vercel.json`: Build and deployment settings

### Deployment Process

1. **Testing**: When a pull request is created, the test workflow runs:
   - Unit tests
   - Integration tests
   - E2E tests
   - Builds the application
   - Creates a build artifact

2. **Deployment**: When changes are merged to main:
   - Builds the application
   - Creates a production build artifact
   - Deploys to Vercel production environment

### Environment Variables

The following environment variables are required:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_FINNHUB_API_KEY`: Finnhub API key
- `VERCEL_TOKEN`: Vercel deployment token

These are configured in GitHub Secrets and automatically injected during deployment.


