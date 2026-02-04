Azure deployment instructions for ShoppingListApp

This guide shows one simple path to host the frontend and API in Azure using mostly-free tiers and GitHub Actions.

Overview
- Frontend: Azure Static Web Apps (free tier) — serves the built Vite app.
- API: Azure App Service (Free/dev tier where available) — hosts the .NET Web API.

High-level steps
1. Create an Azure Resource Group.
2. Create an Azure Static Web App for the frontend (or create from the portal which will add a GitHub Actions workflow automatically).
3. Create an Azure App Service for the `ShoppingList.Api` and capture its publish profile.
4. Add the required GitHub repository secrets.
5. Push to `main` — GitHub Actions will build and deploy.

Commands (Azure CLI)

# 1) login
az login

# 2) create resource group
az group create -n shoppinglist-rg -l eastus

# 3) create App Service Plan (Free tier may not be available in all regions)
az appservice plan create -g shoppinglist-rg -n shoppinglist-plan --is-linux --sku F1

# 4) create Web App for API (unique name required)
az webapp create -g shoppinglist-rg -p shoppinglist-plan -n <your-unique-api-name> --runtime "DOTNET|8.0"

# 5) get publish profile (copy output and set as GitHub secret AZURE_WEBAPP_PUBLISH_PROFILE)
az webapp deployment list-publishing-profiles -g shoppinglist-rg -n <your-unique-api-name> --query "[0]" --output json

Creating the Static Web App (portal recommended)
- The Azure Portal offers a guided creation flow which can connect to GitHub and automatically add deployment workflow and secrets.
- If you prefer CLI, see: az staticwebapp create — it requires a GitHub personal access token and repository information.

GitHub Secrets to add
- `AZURE_WEBAPP_PUBLISH_PROFILE` — the publish profile XML from the Web App (for `api-azure-webapp.yml` action).
- `AZURE_WEBAPP_NAME` — the name of the Web App (used by the workflow).
- `SWA_DEPLOYMENT_TOKEN` — deployment token for the Static Web App (if you created the Static Web App in the portal, you can find the token under "Manage deployment token").

Notes
- If Azure's App Service Free (F1) SKU isn't available, consider using a small B-series or use Azure Container Apps (these may incur costs).
- Azure Static Web Apps includes an API feature backed by Azure Functions; integrating the existing .NET API would require porting to Azure Functions or hosting the API separately (as shown here).

CI/CD
- I added two GitHub Actions workflows in `.github/workflows/`:
  - `frontend-azure-static-web-app.yml` — builds `shoppinglist-web` and uploads to Static Web Apps using `SWA_DEPLOYMENT_TOKEN`.
  - `api-azure-webapp.yml` — builds and publishes `ShoppingList.Api` to an App Service using the publish profile secret.

If you'd like, I can:
- Create the exact `az` commands to create the Static Web App (requires your GitHub repository and a PAT).
- Add an ARM/Bicep template to provision the whole stack and a GitHub Action that runs `az deployment` (you'll still need to login and grant permissions).
- Create a minimal App Service Docker configuration instead of publish profile deployment.

Tell me which option you prefer and whether you want me to add an ARM/Bicep script or a GitHub Actions job that runs `az` to provision resources automatically.
