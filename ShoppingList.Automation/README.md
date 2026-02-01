# ShoppingList.Automation

This folder contains Playwright end-to-end tests for the ShoppingList web app.

Quick start

1. Start the API and the web app (Vite dev server). The Playwright tests expect the frontend to be served at `http://localhost:5173`.

2. From this folder, install dependencies:

```bash
npm install
npx playwright install
```

3. Run tests:

```bash
npm test
```

To run in headed mode (browser visible):

```bash
npm run test:headed
```

View HTML report after a run:

```bash
npm run test:report
```
