
  # NEXTI Testing Platform

  This is a code bundle for NEXTI Testing Platform. The original project is available at https://www.figma.com/design/E1DhAp4azKYaiWl0tl5NKk/NEXTI-Testing-Platform.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## n8n workflows (BDD + scripts)

  Exports live in `n8n-flow/` (`Test Case Generation.json`, `BddToTestScripts.json`). After pulling changes, **re-import** them in your n8n instance so production matches the repo. Until you import, n8n still runs the old workflow (e.g. script flow failing on `LLM output is not valid JSON` is fixed in repo by the **Parse Files JSON** code node + stricter prompt in **BddToTestScripts.json**).

  Source copy of the parser code (for editing, then paste into n8n or re-run merge): `n8n-flow/_parseFilesJsonCode.js`.

  The app sends extra fields from the workspace UI on the BDD webhook: `aiRoles`, `scriptingLanguage`, `maxScenarios`, `creativity`. The scripts webhook receives the same when generating from «Scripts de Prueba», plus `requirementText`, `codeContext`, and `test_hints` when available.

  Copy `.env.example` to `.env` and set `VITE_N8N_WEBHOOK_URL` (BDD), `VITE_N8N_US_WEBHOOK_URL` (user stories), `VITE_N8N_SCRIPTS_WEBHOOK_URL`, and `VITE_N8N_TC_WEBHOOK_URL`.
  For deployed builds, use direct n8n webhook URLs (see `.env.production`). Local dev can still use `/api/*` aliases if you want to route through the Vite proxy.
