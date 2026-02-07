# ShoppingListApp

A small example full-stack shopping list application.

- Backend: ASP.NET Core (.NET 10) Web API using Entity Framework Core and SQLite
- Frontend: React (Vite)
- E2E Test Automation: Playwright (https://exampletestapp-hvd2cbazc8gmbsfk.centralus-01.azurewebsites.net/test-results/index.html#?speedboard)

This repository contains three projects:

- `ShoppingList.Api` - ASP.NET Core Web API, data access with EF Core, and serves static frontend files when deployed.
- `shoppinglist-web` - Vite + React single-page app used during development.
- `ShoppingList.Automation` - Playwright test automation runs on build.

Tech stack

- .NET 10 (ASP.NET Core)
- Entity Framework Core (EF Core) with SQLite provider
- React + Vite for frontend
- C# for backend logic, JavaScript/JSX for frontend UI
- Playwright for test automation, Typescript/JavaScript

Prerequisites

- .NET 10 SDK
- Node.js (for frontend development)
- Optional: `dotnet-ef` tool for generating migrations: `dotnet tool install --global dotnet-ef`

Local development

1. Backend (API)

   - Open a terminal in the `ShoppingList.Api` folder.
   - Build and run:
     - `dotnet build`
     - `dotnet run`

   The app will create a writable SQLite file under your platform's LocalApplicationData folder (a `ShoppingListApp` directory). On startup the API runs `Database.Migrate()` so any pending migrations will be applied automatically.

   Configuration

   - `ShoppingList.Api/appsettings.json` contains a `ConnectionStrings:DefaultConnection` setting but the application currently computes an absolute DB path at startup (see `Program.cs`).
   - CORS policy `dev` allows the Vite dev server origin `http://localhost:5173` for local front-end development.

   Migrations

   - To generate a new migration (recommended over manual files):
     - `dotnet ef migrations add <Name> --project ShoppingList.Api --startup-project ShoppingList.Api`
   - To apply migrations to the database manually:
     - `dotnet ef database update --project ShoppingList.Api --startup-project ShoppingList.Api`

   Troubleshooting

   - "The model for context 'AppDbContext' has pending changes" — create and apply a migration as shown above.
   - API expects an `X-User-Id` header on most item APIs (used to scope items to a user). The frontend sets a persistent client-side value by default.

2. Frontend (Dev)

   - Change into `shoppinglist-web` and install deps:
     - `npm install`
     - `npm run dev` (starts Vite dev server, default `http://localhost:5173`)

   - The frontend expects the API to be available at the same origin by default. To point the frontend to a different API base during dev set `VITE_API_BASE` in your environment (e.g. `VITE_API_BASE=http://localhost:5000 npm run dev`).

Production build / deployment

- Frontend
  - From `shoppinglist-web`: `npm run build` creates an optimized `dist/` folder.
  - You can either host `dist/` separately (static host / CDN) or copy the static files into the API project `wwwroot` for the API to serve them.

- Backend / Hosting
  - The API is a standard ASP.NET Core app and can be deployed to Azure App Service, containers, or any host that supports .NET 10.
  - When deploying to platforms with read-only app content (packaged deployments), the app stores the SQLite DB under the platform's writable location (LocalApplicationData or Azure's `HOME` path). Ensure the host allows writing to that folder.

Notes

- The API code applies migrations at startup using `db.Database.Migrate()` (development-friendly). For production, prefer applying migrations via CI/CD or deployment scripts to control schema changes explicitly.
- The application uses a simple header-based owner id (`X-User-Id`) to separate items by user. The frontend generates/persists a client id in `localStorage` during development.

CI/CD with GitHub Actions and Azure App Service

This project can be built and deployed automatically using GitHub Actions. The recommended approach for Azure App Service is to build both frontend and backend, publish the ASP.NET app (optionally copying the frontend `dist/` into the API `wwwroot`), and deploy the resulting artifact to the Web App.

Recommended GitHub repository secrets

- `AZURE_WEBAPP_NAME` — the name of the Azure Web App
- `AZURE_WEBAPP_PUBLISH_PROFILE` — (optional) the publish profile XML content from the App Service (preferred for simplicity)
- `AZURE_CREDENTIALS` — (alternative) service principal JSON used with `azure/login` action if you prefer service principal auth

Sample GitHub Actions workflow (place under `.github/workflows/ci-cd.yml`)

```yaml
name: CI / CD
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install frontend deps
        working-directory: ./shoppinglist-web
        run: npm ci

      - name: Build frontend
        working-directory: ./shoppinglist-web
        run: npm run build

      - name: Publish backend (includes copying frontend build)
        env:
          DOTNET_CLI_TELEMETRY_OPTOUT: '1'
        run: |
          # copy frontend build into API wwwroot
          rm -rf ShoppingList.Api/wwwroot || true
          mkdir -p ShoppingList.Api/wwwroot
          cp -r shoppinglist-web/dist/* ShoppingList.Api/wwwroot/

          dotnet restore ShoppingList.Api
          dotnet publish ShoppingList.Api -c Release -o published

      - name: Deploy to Azure Web App (Publish Profile)
        if: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE != '' }}
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: published

      - name: Deploy to Azure Web App (Service Principal)
        if: ${{ secrets.AZURE_CREDENTIALS != '' && secrets.AZURE_WEBAPP_PUBLISH_PROFILE == '' }}
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy using Azure CLI
        if: ${{ secrets.AZURE_CREDENTIALS != '' && secrets.AZURE_WEBAPP_PUBLISH_PROFILE == '' }}
        uses: azure/CLI@v1
        with:
          inlineScript: |
            az webapp deploy --resource-group <YourResourceGroup> --name ${{ secrets.AZURE_WEBAPP_NAME }} --src-path published
```

Notes on migrations and database

- Because the app uses SQLite and `Database.Migrate()` at startup, the app will attempt to apply migrations when the Web App starts. That works for single-instance deployments where the host provides writable storage (Azure App Service `HOME`/`D:\home`). For production or multi-instance scenarios consider:
  - Using a managed relational DB (Azure SQL / PostgreSQL) instead of SQLite.
  - Applying migrations from a CI/CD step using `dotnet ef database update` with a properly configured connection string and credentials.

Security and secrets

- Store publish profile or service principal credentials as GitHub Secrets.
- If you use `AZURE_CREDENTIALS` (service principal), create a service principal with least privileges required to deploy to the target App Service or resource group.

Troubleshooting CI/CD

- Check the Actions tab in GitHub for logs. The `dotnet publish` step should produce an artifact folder `published` that contains the web app content.
- If deployment fails due to file system issues on App Service, confirm the target App Service plan supports your runtime and that the app can write to the configured data folder.

Contributing

- Use `dotnet ef migrations add` to create migrations instead of hand-editing files.
- Keep migration files checked into source control so deployed instances can run `Database.Migrate()` or so CI can apply them.

License


