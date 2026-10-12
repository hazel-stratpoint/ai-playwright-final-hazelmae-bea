# Playwright + Cucumber BDD Framework

Playwright browser automation with TypeScript, Cucumber/Gherkin, and the Page Object Model.

## Prerequisites and setup

- Use a Node.js version supported by the installed Cucumber release.
- Install a Java runtime to generate/serve Allure reports using the bundled Allure 2 command-line tool.
- Install dependencies with `npm ci`.
- Install Chromium with `npx playwright install --with-deps chromium`.
- Copy `.env.example` to `.env` and set `BASE_URL` for the target environment.

## AI-assisted workflow

The slash commands must be configured in your AI coding workspace; creating this project does not install or define them.

1. Run `/init-framework <target-folder> [base-url]` once from the workspace where the command is configured. The framework can be scaffolded before application test cases are ready.
2. When test cases are available, run `/generate-test <CSV-path> --project <project-folder> --ids <id,...>` from that workspace, or attach/paste the test cases and identify the target project and IDs.
3. `/generate-test` adds or updates the corresponding Gherkin scenarios, step definitions, locators, and POM methods in this project. Review the changes; do not rerun `/init-framework` just to add cases.
4. If prompt records are part of the project deliverables, save the exact commands/prompts used under `prompt-log/`. Do not include AI responses or chat transcripts.

## Run

- `npm run typecheck` — check TypeScript.
- `npm run test:dry-run` — discover scenarios and bindings without running browser actions.
- `npm run test:scaffold` — verify basic framework wiring against `BASE_URL`.
- `npm run test:smoke` — run scenarios tagged `@smoke`.
- `npm run test:regression` — run scenarios tagged `@regression`.
- `npm test` — run all non-scaffold scenarios.
- `npm run test:headed` — run the non-scaffold suite with a visible browser.

The scaffold scenario is tagged `@scaffold` and excluded from application-suite commands. For this activity, ST-001–ST-010 are tagged `@smoke` (Happy Path), and ST-011–ST-015 are tagged `@regression` (Negative Path). Here, `@regression` is the activity's label for its negative-path set; `npm test` runs both sets together.

## Reports and logs

- Cucumber HTML report: `reports/cucumber-report.html`; serve it with `npm run report:html:open`.
- Allure: generate with `npm run report:allure`, then serve/open with `npm run report:allure:open`.
- Winston logs: `logs/test-run.log`.
- Failure screenshots: `test-results/screenshots/`; screenshots are also attached to failed Cucumber scenarios for reporting.

## Project structure

- `features/` — Gherkin feature files.
- `step-definitions/` — thin Cucumber bindings that call page objects.
- `main/locators/` — verified locator descriptors.
- `main/functions/` — page-object actions and assertions, including training-site behavior.
- `main/utils/` — scenario World, hooks, PageManager, logging, and screenshots.
- `prompt-log/` — exact `/init-framework` and per-case `/generate-test` prompt records.
