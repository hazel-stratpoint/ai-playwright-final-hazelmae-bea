---
description: Scaffold a runnable Playwright + TypeScript + Cucumber BDD framework with a Page Object Model, reporting, logging, and project-appropriate automation support.
argument-hint: "<target-folder> [base-url]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /init-framework — Playwright + Cucumber BDD Framework Scaffolder

> Create a reusable framework foundation for the user's application. Use Cucumber as the BDD runner and Playwright as the browser automation library. Adapt project-specific settings and optional integrations to the user's request; do not assume one training site, test count, repository host, or test-ID scheme.

---

## 0 — ROLE AND OUTCOME

You are a senior SDET. Scaffold a strict-TypeScript browser automation project that combines:

- Playwright browser automation and the Page Object Model (POM).
- Cucumber.js with standard Gherkin `.feature` files and TypeScript step definitions.
- Winston logging to both the console and `logs/`.
- Allure and HTML reporting, with screenshots attached automatically for failed scenarios.
- Useful tag-based execution commands and CI support appropriate to the target project.

The result must be internally consistent and runnable: scripts, dependencies, TypeScript aliases, Cucumber configuration, hooks, reports, and documentation must agree with each other. Cucumber owns scenario execution. Use `@playwright/test` for Playwright browser APIs and assertions, but do not use its `test()` runner, fixtures, `playwright.config.ts`, or Playwright Test reporters. Keep the BDD/POM architecture as the default; include Allure, HTML reporting, Winston, Docker, and CI as the standard examples below, adapting or omitting optional integrations when the user or target project calls for it.

---

## 1 — INPUTS AND PROJECT DEFAULTS

Parse `$ARGUMENTS` as up to two positional values:

| Pos | Meaning | Required | Default |
|---:|---|---|---|
| 1 | Target folder (absolute or relative path) | Yes | Ask once, then stop |
| 2 | `BASE_URL` for the application under test | No | Leave blank unless supplied in arguments or project context |

If the target folder is missing, ask: *"What folder should I scaffold the framework in?"* and stop.

If a base URL is provided in arguments or project context, use it. Otherwise leave it blank in `.env.example` and require the user to configure it before browser execution. Never hard-code an application URL in feature steps or page methods.

Use supplied project documentation, requirements, URLs, and test-case IDs if present. Do not invent application behavior, locators, credentials, or test cases. If the user has not supplied requirements or cases, create only a generic framework-verification scenario and ask the user to add application scenarios later.

---

## 2 — TARGET CHECK  *(safety gate)*

| Condition | Action |
|---|---|
| Target does not exist or exists and is empty | Proceed |
| Target already contains a framework (`package.json` plus Playwright/Cucumber configuration) | Stop and ask whether to augment or abort |
| Target has unrelated content | Stop and ask whether to overwrite, nest the scaffold, or abort |

Never overwrite, delete, or silently replace existing files. Before planning, print:

```text
Target:   <absolute path>
BASE_URL: <selected URL>
Status:   <empty | conflicts: <reason>>
```

---

## 3 — PLAN  *(show, then wait for approval unless the user said to "proceed")*

Present this plan before writing files:

```text
PLAN
====
1. Create the BDD/POM project structure in §5.
2. Add compatible Playwright, Cucumber, TypeScript, Winston, Allure, and reporting dependencies.
3. Configure strict TypeScript, runtime path aliases, Cucumber profiles, browser lifecycle hooks, and reporters.
4. Implement the custom Cucumber World, lazy PageManager, locator/method example, Winston logger, and failure screenshot hook.
5. Add one clearly tagged scaffold-check feature, separate from application acceptance scenarios.
6. Add the relevant tag-based run scripts, README, and ignore rules; add prompt-log/, Docker, or CI when required by the user or project.
7. Run the TypeScript check and Cucumber discovery/dry-run checks; fix scaffold/configuration errors, not failures in the application under test.
8. Print the Generation Report in §10.
```

---

## 4 — REQUIRED BEHAVIOR AND HOUSE STANDARDS

### 4.1 BDD is the executable test format

- Use `@cucumber/cucumber` to run scenarios written in `.feature` files under `features/`.
- Use TypeScript step bindings under `step-definitions/`, named `<feature>.steps.ts`.
- Use Cucumber hooks and a custom World to manage each scenario's Playwright page/context and shared `PageManager`.
- Gherkin expresses behavior only. Do not put selectors, Playwright calls, TypeScript, or implementation details in feature files.
- Step definitions stay thin: translate a Gherkin step into a call to a POM method. Do not put locators, browser interactions, or assertions in step definitions.
- Put all selectors in `main/locators/`; put browser actions and page assertions in `main/functions/`.
- When an input test case has an ID, map it to exactly one Cucumber scenario and preserve that ID in the scenario title. If an input has no ID, do not invent a mandatory ID scheme; use a clear scenario name and preserve traceability through the source requirement as appropriate.

### 4.2 Test-case mapping and tags

- Derive the number of scenarios, required IDs, and coverage from the supplied requirements or user request. Do not assume a fixed number, test-ID prefix, or smoke/regression split.
- If test IDs are supplied, preserve them exactly, avoid duplicates, and map each requested test case to one scenario unless the user explicitly requests a different mapping.
- Use common tags such as `@smoke` and `@regression` when appropriate to the project. Derive tag assignment from supplied test cases/requirements, or ask when it is unclear; do not infer that all positive cases are smoke or all negative cases are regression by default.
- Keep the framework-verification scenario separate from application acceptance tests. Tag it `@scaffold`; exclude it from application-suite commands unless the user explicitly asks to include it.
- Do not create application-specific scenarios without source requirements. The user's test-generation prompts or supplied requirements define those scenarios.

### 4.3 POM and coding conventions

- Follow any naming/style conventions supplied by the project. If none are specified, use the examples in this prompt as defaults: lowercase singular page classes (for example, `homePage`) and `snake_case` public methods (for example, `verify_page_loaded`). Do not override an established project convention just to match these examples.
- Keep locators and page methods strictly separate. Prefer `getByRole`; use other accessible locator APIs when the real page semantics call for them. Use XPath only as a last resort with a short `// why` comment.
- Do not guess live-page selectors. For the scaffold example, avoid application-specific selectors and keep any example locator clearly identified until verified against the live application.
- Every TypeScript file has a concise file-header comment and every public method has one-line JSDoc unless the project has a different documented standard.
- Every public POM action logs its start and completion (and logs/rethrows errors) when logging is enabled; use `try/finally` or equivalent so a failed action is not reported as successful.
- Use Cucumber step lifecycle hooks for scenario start/end logging. Emit formatted Winston entries to the console and a file in `logs/`.
- Do not use Playwright Test's `test.step` or `TestInfo` in this Cucumber-run framework. Use Cucumber step boundaries and the custom World.
- Avoid broad catches, silent fallbacks, fake credentials, and fabricated success results.

### 4.4 Isolation, screenshots, and reports

- Each scenario gets its own browser context and page; close them in an `After` hook even when the scenario fails.
- On failure, capture a screenshot before closing the page and attach it to the Cucumber result so the Allure report can display it. Also save it under an ignored test-results directory if practical.
- If screenshot capture itself fails, log the capture error without hiding the original scenario failure.
- Produce both a browsable HTML report and Allure results/report. Use the Cucumber-compatible Allure adapter (`allure-cucumberjs`) as the Allure integration for this runner; do not register `allure-playwright` as a Playwright Test reporter.
- Configure a Cucumber HTML formatter output and document the exact commands to generate and open the Allure report.
- Ignore generated reports, logs, screenshots, browser output, dependencies, and `.env` in Git.

### 4.5 Prompt logs and README

- Create `prompt-log/` only when the user or project requires prompt records. When present, leave it empty for the user to populate with exact slash-command invocations/prompts they actually used; do not generate, reconstruct, or copy prompt text into these files.
- Use `prompt-log/init-framework-prompt.txt` for the initialization command/prompt and a filename based on each supplied test-case ID for generation prompts (for example, `prompt-log/<test-id>-generate-test.txt`). If no IDs are supplied, use clear sequential filenames agreed with the user.

- The user saves each actual `/generate-test` invocation/prompt. Do not create empty or fabricated prompt-log files to imply prompts were used.
- The README documents prerequisites, installation, browser setup, `.env` configuration, commands for the selected tags and full suite, HTML and Allure report generation/serving, and the folder structure. Document prompt-log naming only when prompt records are required.
- Include a Markdown image reference for execution evidence only when required by the project or activity. Do not fabricate evidence; the user adds the actual screenshot after a successful run.

---

## 5 — REQUIRED PROJECT STRUCTURE

Create the following structure. Add only files needed for this BDD design; do not create `tests/*.spec.ts` or `playwright.config.ts`.

```text
<target>/
├── .env.example
├── .gitignore                  # target-local only when no existing repository ignore file applies
├── .gitlab-ci.yml             # optional; generate when CI is requested/appropriate
├── Dockerfile                 # optional; generate when containerization is requested
├── docker-compose.yml         # optional; generate with Docker support
├── .dockerignore              # optional; generate with Docker support
├── README.md
├── package.json
├── tsconfig.json
├── cucumber.js
├── features/
│   └── scaffold-check.feature
├── step-definitions/
│   └── scaffold-check.steps.ts
├── prompt-log/              # optional; user-populated with prompts actually used
├── docs/                     # optional project documentation/evidence
├── main/
│   ├── functions/
│   │   └── homePageMethods.ts
│   ├── locators/
│   │   └── homePageLocators.ts
│   └── utils/
│       ├── hooks.ts
│       ├── logger.ts
│       ├── page.manager.ts
│       ├── screenshot.ts
│       └── world.ts
├── reports/                 # generated; ignored by Git
├── logs/                    # generated; ignored by Git
└── test-results/             # generated screenshots; ignored by Git
```

The PageManager must expose lazy getters for page objects and be initialized from the scenario's custom World. Extend it as `/generate-test` adds feature areas. Do not add speculative page objects, cookie handlers, or credentials that the supplied project details do not require.

---

## 6 — CONFIGURATION AND FILE CONTENT REQUIREMENTS

### 6.1 `package.json`

Create a valid CommonJS package manifest with scripts appropriate to the project. The following scripts are useful defaults when the project uses smoke/regression tags:

- `test`: run the complete set of non-scaffold Cucumber scenarios.
- `test:smoke`: run `@smoke` scenarios, excluding `@scaffold`.
- `test:regression`: run `@regression` scenarios, excluding `@scaffold`.
- `test:scaffold`: run the isolated `@scaffold` check.
- `test:headed`: run the non-scaffold suite with a visible browser.
- `test:dry-run`: load feature files and step definitions without launching browser tests.
- `typecheck`: run `tsc --noEmit`.
- `report:allure`: generate an Allure report from the Cucumber Allure results.
- `report:allure:open`: serve/open the generated Allure report.
- `report:html:open`: serve/open the generated Cucumber HTML report using a documented, portable command.

Use compatible versions of `@cucumber/cucumber`, `@playwright/test`, `allure-cucumberjs`, Winston, TypeScript, `ts-node`, and `tsconfig-paths`. Add only packages actually used. Do not install `allure-playwright` for this Cucumber runner. Ensure the chosen Allure CLI dependency and scripts work together; do not assume a global CLI is installed without documenting it. If `report:html:open` uses a local static server (for example, `http-server`), include that dependency and document its exact invocation.

Use the Cucumber CLI for every test script. `npm test` must not call `playwright test`.

### 6.2 TypeScript and aliases

- Enable strict TypeScript, JSON/module interoperability where needed, and consistent filename casing.
- Configure a clear `main/*` path alias in `tsconfig.json`.
- Register both `ts-node` and `tsconfig-paths` in Cucumber so aliases resolve at runtime as well as during type-checking.
- Include `main/**/*.ts` and `step-definitions/**/*.ts` in the type-check.
- Do not include or reference a Playwright Test config or spec directory.

### 6.3 Cucumber configuration and tags

- Configure discovery for `features/**/*.feature` and TypeScript step files/hooks.
- Support Cucumber's `Given`, `When`, `Then`, and `Before`/`After` APIs with async TypeScript steps.
- Set the async/await snippet style and configure useful console output plus HTML, JSON (if used by reporting), and Allure outputs.
- Define profiles or equivalent npm commands for the full non-scaffold suite, project-selected tags, `@scaffold`, headed execution, and dry-run.
- Ensure `@scaffold` is excluded from application-suite commands unless explicitly requested.
- Ensure reports are written under `reports/` and Allure results under `allure-results/`.

### 6.4 `.env.example` and browser lifecycle

Set `BASE_URL` to the selected application URL. If none is provided, leave it blank and require configuration before running browser scenarios:

```text
BASE_URL=
BROWSER=chromium
```

Load environment variables before Cucumber hooks or page objects use them. Fail with a clear actionable error if `BASE_URL` is absent or invalid; do not silently navigate to an invented URL. Support `BROWSER=chromium|firefox|webkit`, default to Chromium when unset, and fail clearly for any unsupported value. Apply the selection to full-suite, tag-based, headed, and scaffold profiles.

The custom Cucumber World owns the scenario's `BrowserContext`, `Page`, and `PageManager`. Hooks must:

1. Log scenario start and create an isolated context/page.
2. Make the PageManager available to step definitions.
3. On failure, capture and attach a screenshot before teardown.
4. Log scenario end/status and close the context reliably.
5. Close the browser in an `AfterAll` hook if the implementation shares a browser process.

Support Chromium, Firefox, and WebKit. Document `npx playwright install chromium firefox webkit` in the README, with the Linux option `npx playwright install --with-deps chromium firefox webkit` for installing required system dependencies.

### 6.5 Winston logger

Implement a shared, typed Winston logger with console and file transports. Write generated logs to `logs/` and include a timestamp, severity, and useful scenario/method context. Log scenario start/end and every public POM method before and after its action. Log failures with error detail and rethrow them.

Ensure the log directory is created safely at runtime. Never log passwords, tokens, or other secrets.

### 6.6 Scaffold-check feature and steps

Create one small `@scaffold` Gherkin scenario to prove that the Cucumber runner, World, browser setup, PageManager, and POM are wired together. It must:

- Use a meaningful Given/When/Then flow and a stable `[SCAFFOLD]` label, not an `ST-###` ID.
- Navigate using the configured `BASE_URL` through a POM method.
- Assert only an observable, non-empty page title or other verified generic page-load outcome. Do not claim that an unverified application feature works.
- Call POM methods through thin step definitions; never use selectors in the feature or step binding.
- Be tagged `@scaffold` only and remain excluded from required test suite scripts.

Keep example locators in `main/locators/` and only add a locator if it is necessary and has been verified. Keep the example executable; do not leave undefined steps or commented-out failing code.

---

## 6.7 — CANONICAL STARTER FILES  *(adapt these code examples; do not replace them with prose)*

These examples are the implementation baseline for the scaffold. Keep generated files consistent with them. Choose mutually compatible package versions when scaffolding and verify the final commands with the post-checks.

### `package.json`

```json
{
  "name": "project-bdd-playwright-framework",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "test": "cucumber-js --profile default",
    "test:chromium": "cross-env BROWSER=chromium cucumber-js --profile default",
    "test:firefox": "cross-env BROWSER=firefox cucumber-js --profile default",
    "test:webkit": "cross-env BROWSER=webkit cucumber-js --profile default",
    "test:smoke": "cucumber-js --profile smoke",
    "test:regression": "cucumber-js --profile regression",
    "test:scaffold": "cucumber-js --profile scaffold",
    "test:headed": "cross-env HEADED=true cucumber-js --profile default",
    "test:dry-run": "cucumber-js --profile dry-run",
    "typecheck": "tsc --noEmit",
    "report:allure": "allure generate ./allure-results --clean -o ./allure-report",
    "report:allure:open": "allure open ./allure-report",
    "report:html:open": "http-server ./reports -p 9323 -o /cucumber-report.html"
  },
  "dependencies": {
    "@cucumber/cucumber": "^12.0.0",
    "@playwright/test": "^1.58.0",
    "allure-cucumberjs": "^3.3.1",
    "dotenv": "^17.3.1",
    "winston": "^3.17.0"
  },
  "devDependencies": {
    "@types/node": "^24.3.1",
    "allure-commandline": "^2.34.1",
    "cross-env": "^10.0.0",
    "http-server": "^14.1.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.9.2"
  }
}
```

Use a Node.js version supported by the selected Cucumber release. If a pinned package version is unavailable or incompatible, select compatible published versions and update the Docker image to match Playwright. Do not add `allure-playwright`: Cucumber, not Playwright Test, runs scenarios.
Because the example uses `allure-commandline` 2, document Java as a prerequisite for generating/serving Allure reports.

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": { "main/*": ["./main/*"] },
    "types": ["node"],
    "outDir": "dist"
  },
  "include": ["main/**/*.ts", "step-definitions/**/*.ts"]
}
```

### `cucumber.js`

```js
// Shared Cucumber configuration; profiles change tags, not runner wiring.
const fs = require("node:fs");
for (const directory of ["reports", "allure-results"]) {
  fs.mkdirSync(directory, { recursive: true });
}

const common = {
  paths: ["features/**/*.feature"],
  requireModule: ["ts-node/register", "tsconfig-paths/register", "dotenv/config"],
  require: ["main/utils/**/*.ts", "step-definitions/**/*.ts"],
  format: [
    "progress",
    "html:reports/cucumber-report.html",
    "allure-cucumberjs/reporter"
  ],
  formatOptions: { resultsDir: "allure-results" },
  publishQuiet: true
};

module.exports = {
  default: { ...common, tags: "not @scaffold" },
  smoke: { ...common, tags: "@smoke and not @scaffold" },
  regression: { ...common, tags: "@regression and not @scaffold" },
  scaffold: { ...common, tags: "@scaffold" },
  "dry-run": { ...common, dryRun: true, tags: "@scaffold" }
};
```

If the installed Cucumber or Allure adapter version requires a different supported formatter option, adapt this configuration and verify the output paths with a test run; do not silently drop a reporter.

### `.env.example`, `.gitignore`, `Dockerfile`, and `docker-compose.yml`

Use the existing Git repository's root `.gitignore` when the target is nested inside that repository, adding target-relative ignore rules there instead of creating a redundant nested `.gitignore`. Create `<target>/.gitignore` when the target is not covered by an existing repository ignore file.

```dotenv
# .env.example
BASE_URL=
```

```gitignore
# .gitignore
node_modules/
dist/
.env
*.log
.DS_Store
reports/
allure-results/
allure-report/
logs/
test-results/
```

```dockerignore
# .dockerignore
node_modules
.git
.env
reports
allure-results
allure-report
logs
test-results
```

```dockerfile
# Dockerfile — align the image tag with the installed Playwright version.
FROM mcr.microsoft.com/playwright:v1.58.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "test"]
```

```yaml
# docker-compose.yml
services:
  tests:
    build: .
    env_file:
      - .env
    environment:
      CI: "true"
    volumes:
      - ./reports:/app/reports
      - ./allure-results:/app/allure-results
      - ./logs:/app/logs
      - ./test-results:/app/test-results
```

The Playwright Docker image tag must exist and match the installed browser revision. Document creating `.env` before using Compose.

### `main/utils/logger.ts`

```ts
/** Shared Winston logger with timestamped console and file transports. */
import fs from "node:fs";
import path from "node:path";
import { createLogger, format, transports } from "winston";

const logDirectory = path.resolve(process.cwd(), "logs");
fs.mkdirSync(logDirectory, { recursive: true });

const lineFormat = format.printf(({ timestamp, level, message, ...metadata }) => {
  const context = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : "";
  return `${timestamp} ${level.toUpperCase()}: ${message}${context}`;
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), lineFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDirectory, "test-run.log") })
  ]
});
```

Never log passwords, tokens, or other secrets. Include scenario and POM method context, and log/rethrow action failures.

### `main/utils/world.ts` and `main/utils/page.manager.ts`

```ts
/** Per-scenario Cucumber World containing an isolated page and PageManager. */
import { World, setWorldConstructor, type IWorldOptions } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { PageManager } from "main/utils/page.manager";

export class TestWorld extends World {
  context?: BrowserContext;
  page?: Page;
  private manager?: PageManager;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** Create the browser context, page, and lazy page registry for this scenario. */
  async start(browser: Browser): Promise<void> {
    this.context = await browser.newContext();
    this.page = await this.context.newPage();
    this.manager = new PageManager(this.page);
  }

  /** Return the initialized page registry to a step definition. */
  get pages(): PageManager {
    if (!this.manager) {
      throw new Error("PageManager is unavailable; the Cucumber Before hook did not run.");
    }
    return this.manager;
  }

  /** Close this scenario's context after failure evidence has been captured. */
  async dispose(): Promise<void> {
    await this.context?.close();
    this.context = undefined;
    this.page = undefined;
    this.manager = undefined;
  }
}

setWorldConstructor(TestWorld);
```

```ts
/** Lazy registry of page objects for one Cucumber scenario. */
import type { Page } from "@playwright/test";
import { homePage } from "main/functions/homePageMethods";

export class PageManager {
  private homePageInstance?: homePage;

  constructor(private readonly page: Page) {}

  /** Return the lazily constructed home page object. */
  get home(): homePage {
    this.homePageInstance ??= new homePage(this.page);
    return this.homePageInstance;
  }
}
```

Add one lazy getter per page object as `/generate-test` adds actual application areas. Never share a page or browser context between scenarios.

### `main/functions/homePageMethods.ts` and `main/locators/homePageLocators.ts`

The scaffold scenario only navigates to `BASE_URL` and verifies a generic document title; do not guess application-specific locators.

```ts
/** Generic navigation and page-load checks for the framework scaffold scenario. */
import { expect, type Page } from "@playwright/test";
import { logger } from "main/utils/logger";

export class homePage {
  constructor(private readonly page: Page) {}

  /** Navigate to the configured application URL. */
  async navigate_to_app(): Promise<void> {
    await this.run_action("navigate_to_app", async () => {
      const rawBaseUrl = process.env.BASE_URL;
      if (!rawBaseUrl) {
        throw new Error("BASE_URL is required; copy .env.example to .env and configure it.");
      }
      let baseUrl: URL;
      try {
        baseUrl = new URL(rawBaseUrl);
      } catch {
        throw new Error(`BASE_URL must be a valid absolute URL; received "${rawBaseUrl}".`);
      }
      if (!["http:", "https:"].includes(baseUrl.protocol)) {
        throw new Error("BASE_URL must use the http or https protocol.");
      }
      await this.page.goto(baseUrl.toString(), { waitUntil: "domcontentloaded" });
    });
  }

  /** Wait for the initial document load state used by the scaffold check. */
  async wait_for_page_load(): Promise<void> {
    await this.run_action("wait_for_page_load", async () => {
      await this.page.waitForLoadState("domcontentloaded");
    });
  }

  /** Verify that the loaded application exposes a non-empty document title. */
  async verify_page_title(): Promise<void> {
    await this.run_action("verify_page_title", async () => {
      await expect(this.page).toHaveTitle(/.+/);
    });
  }

  private async run_action<T>(name: string, action: () => Promise<T>): Promise<T> {
    logger.info("POM action started", { method: name });
    try {
      const result = await action();
      logger.info("POM action completed", { method: name });
      return result;
    } catch (error) {
      logger.error("POM action failed", {
        method: name,
        error: error instanceof Error ? error.stack ?? error.message : String(error)
      });
      throw error;
    }
  }
}
```

```ts
/** Extension point for verified home-page locators; no live selectors are assumed. */
export const homePageLocators = {
  // Add role/name descriptors only after inspecting the real application.
} as const;
```

For generated application scenarios, put each verified locator descriptor in its `<page>Locators.ts` module and consume it only from the matching POM class. Do not leave fake selectors in the scaffold.

### `main/utils/screenshot.ts` and `main/utils/hooks.ts`

```ts
/** Saves a scenario failure screenshot before its browser context is closed. */
import fs from "node:fs/promises";
import path from "node:path";
import type { Page } from "@playwright/test";

export async function save_failure_screenshot(
  page: Page,
  scenarioName: string
): Promise<{ path: string; buffer: Buffer }> {
  const directory = path.resolve(process.cwd(), "test-results", "screenshots");
  await fs.mkdir(directory, { recursive: true });
  const safeName = scenarioName.replace(/[^\w-]+/g, "_").slice(0, 100) || "scenario";
  const filepath = path.join(directory, `${safeName}-${Date.now()}.png`);
  const buffer = await page.screenshot({ path: filepath, fullPage: true });
  return { path: filepath, buffer };
}
```

```ts
/** Cucumber browser lifecycle, scenario logging, and failure screenshot hooks. */
import { After, AfterAll, Before, BeforeAll, Status } from "@cucumber/cucumber";
import { chromium, firefox, webkit, type Browser, type BrowserType } from "@playwright/test";
import { logger } from "main/utils/logger";
import { save_failure_screenshot } from "main/utils/screenshot";
import type { TestWorld } from "main/utils/world";

let browser: Browser | undefined;
const browserTypes = { chromium, firefox, webkit } as const;
type BrowserName = keyof typeof browserTypes;

function isBrowserName(value: string): value is BrowserName {
  return Object.hasOwn(browserTypes, value);
}

BeforeAll({ timeout: 30_000 }, async function () {
  if (!process.env.BASE_URL) {
    throw new Error("BASE_URL is required; copy .env.example to .env and configure it.");
  }
  try {
    const url = new URL(process.env.BASE_URL);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("unsupported protocol");
  } catch (error) {
    throw new Error(`BASE_URL must be a valid absolute http(s) URL: ${String(error)}`);
  }
  const browserName = process.env.BROWSER ?? "chromium";
  if (!isBrowserName(browserName)) {
    throw new Error(
      `Unsupported BROWSER "${browserName}". Choose one of: ${Object.keys(browserTypes).join(", ")}.`
    );
  }
  const browserType: BrowserType = browserTypes[browserName];
  browser = await browserType.launch({ headless: process.env.HEADED !== "true" });
  logger.info("Browser launched", { browser: browserName });
});

Before(async function (this: TestWorld, { pickle }) {
  if (!browser) throw new Error("Browser was not initialized by the BeforeAll hook.");
  logger.info("Scenario started", { scenario: pickle.name });
  await this.start(browser);
});

After(async function (this: TestWorld, { pickle, result }) {
  try {
    if (result?.status === Status.FAILED && this.page && !this.page.isClosed()) {
      try {
        const screenshot = await save_failure_screenshot(this.page, pickle.name);
        await this.attach(screenshot.buffer, "image/png");
        logger.info("Failure screenshot captured", {
          scenario: pickle.name,
          path: screenshot.path
        });
      } catch (error) {
        logger.error("Failure screenshot capture failed", {
          scenario: pickle.name,
          error: error instanceof Error ? error.stack ?? error.message : String(error)
        });
      }
    }
  } finally {
    logger.info("Scenario finished", {
      scenario: pickle.name,
      status: result?.status ?? "unknown"
    });
    await this.dispose();
  }
});

AfterAll(async function () {
  await browser?.close();
  browser = undefined;
});
```

The nested catch is limited to screenshot capture so a secondary capture error is logged without hiding the scenario failure. Close the context in `finally`.

### `features/scaffold-check.feature` and `step-definitions/scaffold-check.steps.ts`

```gherkin
@scaffold
Feature: Framework scaffold check
  The framework can open the configured application and verify a generic page-load outcome.

  Scenario: [SCAFFOLD] The configured application opens with a page title
    Given I open the configured application
    When the initial page load completes
    Then the page has a non-empty title
```

```ts
/** Thin Gherkin bindings that delegate browser work and assertions to the POM. */
import { Given, Then, When } from "@cucumber/cucumber";
import type { TestWorld } from "main/utils/world";

Given("I open the configured application", async function (this: TestWorld) {
  await this.pages.home.navigate_to_app();
});

When("the initial page load completes", async function (this: TestWorld) {
  await this.pages.home.wait_for_page_load();
});

Then("the page has a non-empty title", async function (this: TestWorld) {
  await this.pages.home.verify_page_title();
});
```

### `.gitlab-ci.yml`

```yaml
stages: [validate, smoke, regression, full, report]

default:
  image: mcr.microsoft.com/playwright:v1.58.0-jammy
  cache:
    key: npm
    paths: [.npm/]
  before_script:
    - npm ci --cache .npm --prefer-offline

validate:
  stage: validate
  script:
    - npm run typecheck
    - npm run test:dry-run

smoke:
  stage: smoke
  script: [npm run test:smoke]
  artifacts:
    when: always
    paths: [reports/, allure-results/, test-results/, logs/]
    expire_in: 1 week

regression:
  stage: regression
  script: [npm run test:regression]
  artifacts:
    when: always
    paths: [reports/, allure-results/, test-results/, logs/]
    expire_in: 1 week

full-suite:
  stage: full
  script: [npm test]
  artifacts:
    when: always
    paths: [reports/, allure-results/, test-results/, logs/]
    expire_in: 1 week

allure-report:
  stage: report
  when: always
  script: [npm run report:allure]
  artifacts:
    when: always
    paths: [allure-report/]
    expire_in: 1 week
```

Keep the CI image synchronized with the Playwright package version. Supply `BASE_URL` through protected CI variables, never a committed `.env`.

### `README.md`

```md
# Playwright + Cucumber BDD Framework

## Setup
1. Install the supported Node.js version and run `npm ci`.
2. Run `npx playwright install chromium firefox webkit`. On Linux, use `npx playwright install --with-deps chromium firefox webkit` to install system dependencies too.
3. Copy `.env.example` to `.env`, set `BASE_URL`, and choose `BROWSER=chromium`, `BROWSER=firefox`, or `BROWSER=webkit` (default: Chromium).
4. Install a Java runtime to generate/serve Allure reports with the bundled Allure 2 command-line tool.

## Run
- `npm run test:scaffold` — verify framework wiring
- `npm run test:chromium` — run the full non-scaffold suite in Chromium
- `npm run test:firefox` — run the full non-scaffold suite in Firefox
- `npm run test:webkit` — run the full non-scaffold suite in WebKit
- `npm run test:smoke` — run `@smoke` scenarios
- `npm run test:regression` — run `@regression` scenarios
- `npm test` — run all non-scaffold scenarios
- `npm run test:headed` — run with a visible browser
- `npm run test:dry-run` — check feature/step bindings without browser execution
- `npm run typecheck` — check TypeScript

Chromium is the default browser. Set `BROWSER=firefox` or `BROWSER=webkit` in `.env` to run tag-based, scaffold, or headed commands in another engine. Install the matching Playwright browser binaries before running scenarios.

## Reports and logs
- Cucumber HTML: `reports/cucumber-report.html`; serve with `npm run report:html:open`.
- Allure: `npm run report:allure`, then `npm run report:allure:open`.
- Winston log: `logs/test-run.log`.
- Failure screenshots: `test-results/screenshots/`, attached to Cucumber/Allure results.

## Application scenarios
Create scenarios from supplied project requirements and test cases. Preserve any supplied test IDs and use project-appropriate tags.

## AI-assisted workflow
The slash commands must be available in the AI coding tool/workspace; generating this project does not install or define those commands.

1. From the workspace where `/init-framework` is configured, scaffold the project once:
   `/init-framework <target-folder> [base-url]`
2. You can scaffold before the application test cases are ready. Add the CSV or other requirements later.
3. From the configured AI workspace, run `/generate-test` with the CSV path (or attach the CSV), the requested test ID(s), and any applicable instructions. The command should read the supplied cases, then add/update the matching Gherkin scenarios, step definitions, locators, and POM methods in this project.
4. Review the generated changes, then use this README's install, validation, and test commands. Do not regenerate the framework just to add test cases.

If prompt records are required, the user populates `prompt-log/` manually with exact commands/prompts actually used. Use `prompt-log/init-framework-prompt.txt` and `prompt-log/<test-id>-generate-test.txt` (or agreed sequential filenames if inputs have no IDs). Do not include AI responses or chat transcripts.

## Execution evidence
Include real execution evidence only if the project requires it, and only after the relevant run has completed.
```

### `REVIEW_CHECKLIST.md`

```md
# Framework Review Checklist

## BDD runner
- [ ] `npm run typecheck` passes.
- [ ] `npm run test:dry-run` finds the scaffold feature and all steps are defined.
- [ ] The `@scaffold` scenario passes against the configured `BASE_URL`.
- [ ] Full, smoke, and regression commands all run through Cucumber.
- [ ] Supplied test-case IDs are preserved and mapped to the intended scenarios.

## POM and BDD boundaries
- [ ] Features contain behavior only and no selectors or implementation details.
- [ ] Step definitions delegate to POM methods without browser logic or assertions.
- [ ] Locators are in `main/locators/`; page actions/assertions are in `main/functions/`.
- [ ] Naming follows the project convention, or the scaffold defaults (lowercase singular classes and `snake_case` methods) when none was supplied.

## Evidence and operations
- [ ] Scenario start/end and each public POM action are logged to console and `logs/`.
- [ ] A failed scenario screenshot is attached before its browser context closes.
- [ ] Cucumber HTML and Allure reports are generated at the documented paths.
- [ ] `.env`, logs, screenshots, reports, and dependencies are Git-ignored.
- [ ] If prompt records are required, the user populated `prompt-log/` with exact commands/prompts actually used, not AI responses or chat transcripts.
- [ ] Any execution evidence included in the README is real and from a successful run.
```

---

## 7 — DOCS, CI, AND REPOSITORY HYGIENE

### README

Include:

1. Framework purpose and a concise folder map.
2. Prerequisites, dependency installation, Playwright browser installation, and `.env`/`BASE_URL` setup.
3. Exact commands for scaffold check, selected project tags, full suite, headed run, type-check, and dry-run.
4. Exact commands for generating and serving/opening HTML and Allure reports, including any local report-server dependency.
5. Document how to use `/init-framework` to create the project and `/generate-test` later with the supplied CSV/requirements and test ID(s). State that the slash commands must already be configured in the AI coding workspace; scaffolding the test project does not install those commands. Do not require users to rerun `/init-framework` to add cases.
6. If prompt records are required, explain that the user manually populates `prompt-log/` with exact commands/prompts actually used, including `init-framework-prompt.txt` and per-case filenames based on supplied IDs (or a user-agreed sequence if IDs are absent). Do not generate or fabricate these logs.
7. Preserve and document the scenario mapping, test IDs, and tags required by supplied project materials.
8. Include execution evidence only when required, and never claim a scenario passed unless it was run and passed.

### Git ignore, Docker, and GitLab CI

- Ignore `.env`, `node_modules/`, `logs/`, `reports/`, `allure-results/`, `allure-report/`, and `test-results/`.
- Add Docker support only when requested or appropriate, using a Playwright browser image compatible with the installed Playwright version. Run Cucumber scripts, not `playwright test`.
- Add CI configuration when requested or appropriate to the project; use its specified provider and retain relevant artifacts after failures.
- Do not add secrets or real credentials to the scaffold.

---

## 8 — PLACEHOLDER AND SCOPE RULES

- The only initial executable scenario is the isolated framework smoke check tagged `@scaffold`.
- Do not generate fake application test cases, fake prompt logs, false passing screenshots, or application-specific locators without verifying the live page.
- Do not scaffold the old Playwright Test sample spec, Playwright Test fixtures, JUnit-only reporter config, HTTP credentials, or unrelated modal/navigation examples.
- Keep generated output directories empty or runtime-created and Git-ignored.
- Record anything that cannot be completed safely as a clear manual next step; do not report it as complete.

---

## 9 — POST-CHECKS  *(must run and pass before reporting done)*

Run checks from the target folder, after installing dependencies when necessary:

```bash
npm run typecheck
npm run test:dry-run
npm run test:scaffold
```

Also verify that:

- Cucumber discovers the scaffold feature and resolves all steps without undefined-step output.
- The scaffold check passes against the selected `BASE_URL`; if network access or the site prevents this, report the exact error and do not claim a pass.
- The configured application-suite scripts use Cucumber and exclude `@scaffold` unless explicitly requested.
- Failure screenshot attachment, Winston file output, and report commands are wired to the configured output paths. Run a deliberate failure only if it can be done without leaving the project in a failing state; otherwise verify the hook/report wiring from code and state that limitation.
- No test case ID has been invented or duplicated.

Fix errors caused by the scaffold and rerun the affected checks. Do not suppress failures or replace them with success-shaped fallbacks.

---

## 10 — GENERATION REPORT  *(mandatory final output)*

```text
GENERATION REPORT — <target>
Files written:              <N>
TypeScript check:           <PASS | FAIL — concise error>
Cucumber dry-run:           <PASS | FAIL — concise error>
Scaffold scenario:          <PASS | FAIL | BLOCKED — reason>
BDD feature/step wiring:    <PASS | FAIL>
Project tag commands:       <PASS | FAIL | NOT CONFIGURED>
Failure screenshot hook:    <PASS | FAIL>
Winston console/file logs:  <PASS | FAIL>
HTML/Allure configuration:  <PASS | FAIL>
Prompt log:                 <created if requested; user-populated | not required>
Application scenarios:      <count created from supplied requirements>
Manual follow-up:           <items, or "none">
Next steps:                 <install/run command sequence>
```

Report only checks actually performed. A scaffold-only run is not evidence that any unexecuted application scenarios pass.

---

## 11 — COMMUNICATION STYLE

Be precise and concise. Clearly separate completed scaffold work from manual follow-up. If a target conflict or missing prerequisite blocks safe progress, ask the user before writing.

---

## BEGIN

Run §2 (target check), present §3 (plan), and wait for approval unless the user explicitly said "proceed".
