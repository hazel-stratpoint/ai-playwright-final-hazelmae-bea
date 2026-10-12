---
description: Scaffold a complete, runnable Playwright + TypeScript automation framework (POM + lazy PageManager + custom fixtures + Allure/JUnit/HTML reporting + Docker + GitLab CI). QA runs this once per project, then `npm install && npm test`.
argument-hint: "<target-folder> [base-url]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /init-framework — Stratpoint Playwright Framework Scaffolder

> Builds a framework that is **runnable end-to-end** — QA just installs deps and executes specs.

---

## 0 — ROLE

You are a **Senior SDET at Stratpoint Technologies** with deep expertise in Playwright Test, strict TypeScript, the Page Object Model, lazy-loaded `PageManager`, and Allure/JUnit/HTML reporting. You follow the house style exactly — you never invent new patterns.

---

## 1 — INPUTS

Parse `$ARGUMENTS` as up to two positional values:

| Pos |  Meaning                                      | Required | Fallback                                    |
|----:|-----------------------------------------------|----------|---------------------------------------------|
|   1 | Target folder (absolute or relative path)     | **yes**  | Ask the user once, then stop                |
|   2 | `BASE_URL` for the app under test             | no       | Leave `.env.example` blank                  |

If position 1 is missing, ask: *"What folder should I scaffold the framework in?"* and stop.

> Source code is **not** an input. Stratpoint frameworks are scaffolded blind — the reference home page ships as a placeholder, then QA replaces locators after the first live run (or via `/generate-test`, which uses Playwright MCP to inspect the live DOM).

---

## 2 — TARGET CHECK  *(safety gate — not a "mode")*

| Condition                                                  | Action                                          |
|------------------------------------------------------------|-------------------------------------------------|
| Target does not exist OR exists and is empty               | Proceed with scaffold                           |
| Target has `package.json` + `playwright.config.ts` already | Stop and ask whether to augment or abort        |
| Target has unrelated content                               | Stop and ask: overwrite, nest, or abort         |

**Print before doing anything:**

```
Target:   <absolute path>
BASE_URL: <url or "(blank — fill in .env later)">
Status:   <empty | conflicts: <reason>>
```

---

## 3 — PLAN  *(present, then wait for "yes / proceed" — skip approval only if user wrote "just do it")*

```
PLAN
====
1. Create directory tree (§5)
2. Write config files: package.json, tsconfig.json, playwright.config.ts, .env.example, .gitignore, .dockerignore, Dockerfile, docker-compose.yml, .gitlab-ci.yml, allurerc.mjs, README.md, REVIEW_CHECKLIST.md
3. Write utilities: main/utils/{base.fixture, page.manager, logger, screenshot, credential.decoder}.ts
4. Write reference modal: main/functions/modals/privacyPolicyCookie.ts
5. Write reference navigation: main/locators/navigationLocators.ts + main/functions/navigationMethods.ts
6. Write reference home page: main/locators/homePageLocators.ts + main/functions/homePageMethods.ts
  (Realistic placeholder locators — QA replaces them after first live run or via /generate-test.)
7. Write sample spec: tests/homepagetest.spec.ts
8. Write test data: data/user.json (base64-encoded neutral placeholders)
9. Run `npx tsc --noEmit` and `npx playwright test --list` — both must pass
10. Print Generation Report (§9)
```

---

## 4 — CODING STANDARDS

> Canonical rules live in `CLAUDE.md` at the project root and are always in context. Highlights relevant to scaffolding:
> - Lowercase singular class names (`homePage`, not `LoginPage`).
> - `snake_case` public methods; one-line JSDoc on every public method and file header.
> - Locators in `main/locators/`, methods in `main/functions/` — no cross-contamination.
> - Every method body: `test.step` wrapper + `logger.info` before/after + `screenshot.captureStep` on state changes.
> - `getByRole` first; XPath only with a `// why` comment.

---

## 5 — PROJECT STRUCTURE

```
<target>/
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── .gitlab-ci.yml
├── allurerc.mjs
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── README.md
├── REVIEW_CHECKLIST.md
├── .env.example
├── data/
│   └── user.json
├── main/
│   ├── functions/
│   │   ├── homePageMethods.ts
│   │   ├── navigationMethods.ts
│   │   └── modals/
│   │       └── privacyPolicyCookie.ts
│   ├── locators/
│   │   ├── homePageLocators.ts
│   │   └── navigationLocators.ts
│   └── utils/
│       ├── base.fixture.ts
│       ├── page.manager.ts
│       ├── logger.ts
│       ├── screenshot.ts
│       └── credential.decoder.ts
└── tests/
   └── homepagetest.spec.ts
```

---

## 6 — CANONICAL FILE CONTENTS  *(few-shot grounding — copy these shapes exactly, adapting only names/locators)*

### 6.1 `package.json`
```json
{
 "name": "<FRAMEWORK_NAME>",
 "version": "1.0.0",
 "description": "Playwright + TypeScript automation framework (Stratpoint house standard).",
 "type": "commonjs",
 "scripts": {
   "test": "npx playwright test --workers=3",
   "test:smoke": "npx playwright test --project=smoke",
   "test:headed": "npx playwright test --headed",
   "test:debug": "npx playwright test --debug",
   "report:open": "npx playwright show-report",
   "allure:clean": "npx rimraf ./allure-report ./allure-results",
   "allure:open": "npx allure open ./allure-report",
   "test:run_all_allure": "npm run allure:clean && npx allure run -c allurerc.mjs --output ./allure-report -- npx playwright test && npm run allure:open"
 },
 "keywords": ["playwright", "typescript", "e2e", "automation"],
 "license": "ISC",
 "devDependencies": {
   "@playwright/test": "^1.58.0",
   "@types/fs-extra": "^11.0.4",
   "@types/node": "^24.3.1",
   "allure": "^3.3.1",
   "allure-playwright": "^3.6.0",
   "playwright": "^1.58.0",
   "rimraf": "^6.1.3",
   "ts-node": "^10.9.2",
   "typescript": "^5.9.2"
 },
 "dependencies": {
   "dotenv": "^17.3.1",
   "fs-extra": "^11.3.1"
 }
}
```

### 6.2 `tsconfig.json`
```json
{
 "compilerOptions": {
   "target": "ES2022",
   "module": "CommonJS",
   "moduleResolution": "node",
   "strict": true,
   "esModuleInterop": true,
   "resolveJsonModule": true,
   "skipLibCheck": true,
   "forceConsistentCasingInFileNames": true,
   "baseUrl": ".",
   "paths": { "main/*": ["main/*"] },
   "outDir": "dist"
 },
 "include": ["main/**/*.ts", "tests/**/*.ts", "playwright.config.ts"]
}
```

### 6.3 `playwright.config.ts`
```ts
import { defineConfig, devices } from '@playwright/test';
import { getUserData } from 'main/utils/credential.decoder';
import 'dotenv/config';


const { username, password } = getUserData();


export default defineConfig({
 testDir: './tests',
 fullyParallel: true,
 forbidOnly: !!process.env.CI,
 retries: process.env.CI ? 2 : 0,
 workers: process.env.CI ? 1 : 3,
 reporter: [
   ['line'],
   ['allure-playwright', { outputFolder: './allure-results', detail: true }],
   ['list'],
   ['html'],
   ['junit', { outputFile: 'test-results/junit-report.xml' }],
 ],
 use: {
   baseURL: process.env.BASE_URL,
   httpCredentials: { username, password },
   trace: 'retain-on-failure',
   screenshot: 'only-on-failure',
   ignoreHTTPSErrors: true,
 },
 projects: [
   { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
   { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
   { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
   { name: 'GChrome',  use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
   { name: 'smoke',    grep: /@smoke/, use: { ...devices['Desktop Chrome'] } },
 ],
});
```

### 6.4 `.env.example`
```
BASE_URL=
```

### 6.5 `.gitignore`
```
node_modules/
test-results/
playwright-report/
allure-results/
allure-report/
.env
*.log
.DS_Store
dist/
```

### 6.6 `Dockerfile`
```dockerfile
FROM mcr.microsoft.com/playwright:v1.58.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "test"]
```

### 6.7 `docker-compose.yml`
```yaml
services:
 tests:
   build: .
   environment:
     - CI=true
   volumes:
     - ./test-results:/app/test-results
     - ./playwright-report:/app/playwright-report
```

### 6.8 `.gitlab-ci.yml`
```yaml
stages: [lint, smoke, regression, report]


default:
 image: mcr.microsoft.com/playwright:v1.58.0-jammy


variables:
 npm_config_cache: "$CI_PROJECT_DIR/.npm"


cache:
 paths: [.npm/, node_modules/]


before_script:
 - npm ci


lint:
 stage: lint
 script: [npx tsc --noEmit]


smoke:
 stage: smoke
 script: [npm run test:smoke]
 artifacts: { when: always, paths: [test-results/, playwright-report/], expire_in: 1 week }


regression:
 stage: regression
 script: [npm test]
 artifacts: { when: always, paths: [test-results/, playwright-report/, allure-results/], expire_in: 1 week }


report:
 stage: report
 script: [npx allure generate ./allure-results --clean -o ./allure-report]
 artifacts: { paths: [allure-report/], expire_in: 1 week }
```

### 6.9 `allurerc.mjs`
```js
export default {
 resultsDir: './allure-results',
 reportDir: './allure-report',
};
```

### 6.10 `data/user.json`  *(neutral base64: `user` / `password`)*
```json
{ "Username": "dXNlcg==", "Password": "cGFzc3dvcmQ=" }
```

### 6.11 `main/utils/credential.decoder.ts`
```ts
/** Reads data/user.json and returns base64-decoded HTTP credentials. */
import fs from 'fs-extra';
import path from 'path';


/** Load and decode the Username/Password pair; returns empty strings if the file is missing. */
export function getUserData(): { username: string; password: string } {
 const file = path.join(process.cwd(), 'data', 'user.json');
 if (!fs.existsSync(file)) return { username: '', password: '' };
 const raw = fs.readJsonSync(file);
 return {
   username: Buffer.from(raw.Username ?? '', 'base64').toString('utf8'),
   password: Buffer.from(raw.Password ?? '', 'base64').toString('utf8'),
 };
}
```

### 6.12 `main/utils/logger.ts`
```ts
/** Timestamped logger that writes to console and optionally to test-results/logs/<test>.log. */
import fs from 'fs-extra';
import path from 'path';


export class Logger {
 private logs: string[] = [];
 private logFile: string | null = null;


 /** When testName is provided, all entries are also appended to a per-test log file. */
 constructor(testName?: string) {
   if (testName) {
     const safeName = testName.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
     const logsDir = path.join('test-results', 'logs');
     fs.ensureDirSync(logsDir);
     this.logFile = path.join(logsDir, `${safeName}.log`);
   }
 }


 /** Append a timestamped entry to memory, console, and (if configured) the log file. */
 log(message: string) {
   const entry = `[${new Date().toISOString()}] ${message}`;
   this.logs.push(entry);
   console.log(entry);
   if (this.logFile) fs.appendFileSync(this.logFile, entry + '\n');
 }


 /** Log an INFO-level message. */
 info(message: string)  { this.log(`INFO: ${message}`); }
 /** Log an ERROR-level message. */
 error(message: string) { this.log(`ERROR: ${message}`); }
 /** Return all in-memory entries joined by newlines. */
 getLogs(): string      { return this.logs.join('\n'); }
 /** Drop all in-memory entries (file content is preserved). */
 clear()                { this.logs = []; }
}
```

### 6.13 `main/utils/screenshot.ts`
```ts
/** Per-test screenshot helper with monotonic step counter; saves under test-results/screenshots/<test>/. */
import { Page, Locator, TestInfo } from '@playwright/test';
import fs from 'fs-extra';
import path from 'path';


/** Options accepted by capture* helpers. */
interface CaptureOptions {
 fullPage?: boolean;
 format?: 'png' | 'jpeg';
 quality?: number;
 timeout?: number;
 clip?: { x: number; y: number; width: number; height: number };
 omitBackground?: boolean;
}


export class ScreenshotHelper {
 private stepCounter = 1;
 private readonly screenshotDir: string;
 private readonly testInfo: TestInfo;


 constructor(testInfo: TestInfo) {
   this.testInfo = testInfo;
   const safeTitle = testInfo.title.replace(/\s+/g, '_').replace(/[^\w]/g, '');
   this.screenshotDir = path.join('test-results', 'screenshots', safeTitle);
   fs.ensureDirSync(this.screenshotDir);
 }


 /** Current 1-based step counter. */
 get step(): number { return this.stepCounter; }


 /** Capture a page-level screenshot, attach to the report, and bump the step counter. */
 async captureStep(page: Page, stepName: string, opts: boolean | CaptureOptions = false): Promise<string> {
   if (page.isClosed()) throw new Error('page is closed');
   const o: CaptureOptions = typeof opts === 'boolean' ? { fullPage: opts } : opts;
   const format = o.format ?? 'png';
   const safe = stepName.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
   const filepath = path.join(this.screenshotDir, `step${this.stepCounter}-${safe}.${format}`);
   await page.screenshot({
     path: filepath,
     fullPage: o.fullPage ?? false,
     type: format,
     quality: format === 'jpeg' ? (o.quality ?? 80) : undefined,
     timeout: o.timeout ?? 30_000,
     clip: o.fullPage ? undefined : o.clip,
     omitBackground: o.omitBackground,
   });
   await this.testInfo.attach(`Step ${this.stepCounter}: ${stepName}`, {
     path: filepath,
     contentType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
   });
   this.stepCounter++;
   return filepath;
 }


 /** Capture a single element's screenshot, attach it, and bump the step counter. */
 async captureElement(locator: Locator, stepName: string, options: Pick<CaptureOptions, 'format' | 'quality' | 'timeout' | 'omitBackground'> = {}): Promise<string> {
   const format = options.format ?? 'png';
   const safe = stepName.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
   const filepath = path.join(this.screenshotDir, `step${this.stepCounter}-${safe}.${format}`);
   await locator.screenshot({
     path: filepath,
     type: format,
     quality: format === 'jpeg' ? (options.quality ?? 80) : undefined,
     timeout: options.timeout ?? 30_000,
     omitBackground: options.omitBackground,
   });
   await this.testInfo.attach(`Step ${this.stepCounter}: ${stepName}`, {
     path: filepath,
     contentType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
   });
   this.stepCounter++;
   return filepath;
 }


 /** Take a "before" snap, run the action, then take an "after" snap; returns both paths. */
 async captureBeforeAfter(page: Page, label: string, action: () => Promise<void>, options: CaptureOptions = {}) {
   const before = await this.captureStep(page, `${label}_before`, options);
   await action();
   const after = await this.captureStep(page, `${label}_after`, options);
   return { before, after };
 }
}
```

### 6.14 `main/utils/page.manager.ts`
```ts
/** Lazy-loaded registry of every page object; shares one ScreenshotHelper for a monotonic step counter. */
import { Page, TestInfo } from '@playwright/test';
import { homePage } from '../functions/homePageMethods';
import { navbarPage } from '../functions/navigationMethods';
import { privacyPolicyCookie } from '../functions/modals/privacyPolicyCookie';
import { ScreenshotHelper } from './screenshot';


export class PageManager {
 private readonly page: Page;
 private readonly testInfo: TestInfo;
 readonly screenshot: ScreenshotHelper;


 private _homePage?: homePage;
 private _navbarPage?: navbarPage;
 private _privacyPolicyCookie?: privacyPolicyCookie;


 /** Construct the manager; ScreenshotHelper is created eagerly so the step counter is shared. */
 constructor(page: Page, testInfo: TestInfo) {
   this.page = page;
   this.testInfo = testInfo;
   this.screenshot = new ScreenshotHelper(testInfo);
 }


 /** The raw Playwright Page handle (rarely needed by tests). */
 get thisPage(): Page { return this.page; }


 /** Lazy-init the home page object. */
 get home(): homePage {
   if (!this._homePage) this._homePage = new homePage(this.page, this.testInfo, this.screenshot);
   return this._homePage;
 }


 /** Lazy-init the navbar page object. */
 get navbar(): navbarPage {
   if (!this._navbarPage) this._navbarPage = new navbarPage(this.page);
   return this._navbarPage;
 }


 /** Lazy-init the privacy-policy / cookie modal handler. */
 get privacyCookie(): privacyPolicyCookie {
   if (!this._privacyPolicyCookie) this._privacyPolicyCookie = new privacyPolicyCookie(this.page);
   return this._privacyPolicyCookie;
 }
}
```

### 6.15 `main/utils/base.fixture.ts`
```ts
/** Custom Playwright fixtures: pm (bare manager), pmWithCookies (navigated), capture (standalone helper). */
import { test as base } from '@playwright/test';
import { PageManager } from './page.manager';
import { ScreenshotHelper } from './screenshot';


/** Fixture shape exposed by this file. */
type Fixtures = {
 pm: PageManager;
 pmWithCookies: PageManager;
 capture: ScreenshotHelper;
};


export const test = base.extend<Fixtures>({
 /** Fresh PageManager; test handles its own navigation. */
 pm: async ({ page }, use, testInfo) => {
   await use(new PageManager(page, testInfo));
 },
 /** PageManager pre-navigated to "/" with the cookie modal dismissed. */
 pmWithCookies: async ({ page }, use, testInfo) => {
   const pm = new PageManager(page, testInfo);
   await pm.navbar.navigate();
   await pm.privacyCookie.handleCookieModal();
   await use(pm);
 },
 /** Standalone ScreenshotHelper for ad-hoc captures without going through PageManager. */
 capture: async ({}, use, testInfo) => {
   await use(new ScreenshotHelper(testInfo));
 },
});


export { expect } from '@playwright/test';
```

### 6.16 `main/locators/navigationLocators.ts`
```ts
/** Locator descriptors for the global site navbar; consumed by navigationMethods.ts. */
export const navLocators = {
 home:      { alttext: 'Home' },
 contactUs: { role: 'link' as const, text: { name: 'Contact Us' } },
 portfolio: { role: 'link' as const, text: { name: 'Portfolio', exact: true } },
};
```

### 6.17 `main/functions/navigationMethods.ts`
```ts
/** Page object for the global site navbar: navigate to "/" and click nav links by name. */
import { Page, Locator } from '@playwright/test';
import { navLocators } from '../locators/navigationLocators';
import { Logger } from '../utils/logger';


export class navbarPage {
 readonly page: Page;
 private logger: Logger;
 readonly homeNavLink: Locator;
 readonly contactUsLink: Locator;
 readonly portfolioLink: Locator;


 /** Build the navbar locators from the shared Page handle. */
 constructor(page: Page) {
   this.page = page;
   this.logger = new Logger();
   this.homeNavLink   = page.getByAltText(navLocators.home.alttext);
   this.contactUsLink = page.getByRole(navLocators.contactUs.role, navLocators.contactUs.text);
   this.portfolioLink = page.getByRole(navLocators.portfolio.role, navLocators.portfolio.text);
 }


 /** Open the BASE_URL home page and wait for DOMContentLoaded. */
 async navigate(): Promise<void> {
   await this.page.goto('/', { timeout: 60000, waitUntil: 'domcontentloaded' });
   this.logger.info('Navigated to home page');
 }


 /** Click a navbar entry by short name; throws if the name is unknown. */
 async navbar_link(selectpage: string): Promise<void> {
   switch (selectpage) {
     case 'home':      await this.homeNavLink.click(); break;
     case 'contactus': await this.contactUsLink.click(); break;
     default:          throw new Error(`Unknown page: "${selectpage}"`);
   }
 }
}
```

### 6.18 `main/functions/modals/privacyPolicyCookie.ts`
```ts
/** Page object for the cookie-consent modal; no-op when the modal is absent. */
import { Page, Locator } from '@playwright/test';
import { Logger } from '../../utils/logger';


export class privacyPolicyCookie {
 readonly page: Page;
 private logger: Logger;
 readonly modalText: Locator;
 readonly acceptAll: Locator;
 readonly rejectAllButton: Locator;


 /** Build the cookie-modal locators from the shared Page handle. */
 constructor(page: Page) {
   this.page = page;
   this.logger = new Logger();
   this.modalText       = page.getByText('Accept All');
   this.acceptAll       = page.getByRole('button', { name: 'Accept All' });
   this.rejectAllButton = page.getByRole('button', { name: 'Reject All' });
 }


 /** Click "Accept All" when the modal is visible; safely skip when it isn't. */
 async handleCookieModal(): Promise<void> {
   try {
     if (await this.modalText.isVisible({ timeout: 5000 })) {
       await this.acceptAll.click();
       this.logger.info('Accepted Cookie');
     }
   } catch {
     this.logger.info('Cookie modal not found — skipping');
   }
 }
}
```

### 6.19 `main/locators/homePageLocators.ts`  *(placeholder — replace role/name pairs after first live run)*
```ts
/** Locator descriptors for the home page; placeholders — confirm via live MCP run. */
export const homePageLocators = {
 // TODO: Replace with real locators after first live run.
 bannerHeader:  { role: 'heading' as const, text: { name: 'Welcome' } },
 primaryButton: { role: 'button'  as const, text: { name: 'Get Started' } },
};
```

### 6.20 `main/functions/homePageMethods.ts`  *(placeholder)*
```ts
/** Page object for the home page; methods here are illustrative placeholders. */
import { test, Page, Locator, expect, TestInfo } from '@playwright/test';
import { homePageLocators } from '../locators/homePageLocators';
import { Logger } from '../utils/logger';
import { ScreenshotHelper } from '../utils/screenshot';


export class homePage {
 readonly page: Page;
 private logger: Logger;
 private screenshot: ScreenshotHelper;
 readonly bannerHeader: Locator;
 readonly primaryButton: Locator;


 /** Build the home-page locators from the shared Page handle and ScreenshotHelper. */
 constructor(page: Page, private testinfo: TestInfo, screenshot: ScreenshotHelper) {
   this.page = page;
   this.logger = new Logger();
   this.screenshot = screenshot;
   this.bannerHeader  = page.getByRole(homePageLocators.bannerHeader.role,  homePageLocators.bannerHeader.text);
   this.primaryButton = page.getByRole(homePageLocators.primaryButton.role, homePageLocators.primaryButton.text);
 }


 /** Assert the banner header is visible and capture a full-page screenshot. */
 async verify_header(): Promise<void> {
   await test.step('Verify banner header is visible', async () => {
     this.logger.info('verify_header — start');
     await expect(this.bannerHeader).toBeVisible();
     await this.screenshot.captureStep(this.page, 'Header visible', { fullPage: true });
     this.logger.info('verify_header — success');
   });
 }
}
```

### 6.21 `tests/homepagetest.spec.ts`
```ts
/** Sample spec — smoke check that the home page loads, plus a regression check on the banner header. */
import { test, expect } from 'main/utils/base.fixture';


test.describe.configure({ mode: 'serial' });


test.describe('Home Page test suite', () => {
 /** Navigate to "/" and dismiss the cookie modal before every test. */
 test.beforeEach(async ({ pm }) => {
   await pm.navbar.navigate();
   await pm.privacyCookie.handleCookieModal();
 });


 test('Smoke — home loads @smoke', async ({ pm }) => {
   await expect(pm.thisPage).toHaveURL(/.+/);
 });


 test('Verify section header @regression', async ({ pm }) => {
   await pm.home.verify_header();
 });
});
```

### 6.22 `README.md`  *(minimal — QA edits later)*
```md
# <FRAMEWORK_NAME>


Playwright + TypeScript automation framework — Stratpoint house standard.


## Setup
1. `npm install`
2. `npx playwright install --with-deps`
3. `cp .env.example .env` and fill `BASE_URL`.


## Run
- `npm test` — all tests
- `npm run test:smoke` — `@smoke` only
- `npm run test:headed` — visible browser
- `npm run report:open` — open the HTML report


## Add a new test
Use `/generate-test` from Claude Code.
```

### 6.23 `.dockerignore`
```
node_modules
test-results
playwright-report
allure-results
allure-report
.env
.git
.github
.vscode
```

### 6.24 `REVIEW_CHECKLIST.md`  *(QA's review path — generated verbatim, edit per project as needed)*
````md
# Framework Review Checklist


> Walk this list before declaring the framework "ready for use." 
> Tick items, note what changed, hand off to the next reviewer.


---


## 1. Install & smoke run
- [ ] `npm install` completes without errors
- [ ] `npx playwright install --with-deps` completes
- [ ] `cp .env.example .env` and fill in `BASE_URL`
- [ ] `npm test` runs and the sample spec passes (or fails for the right reason)
- [ ] `npm run report:open` shows the HTML report


## 2. Configuration
- [ ] `.env` has the correct `BASE_URL` for your environment
- [ ] `data/user.json` credentials are filled in (still base64) — or left as `user`/`password` placeholders if not needed


## 3. Folder conventions
- [ ] `main/locators/` files contain ONLY locator descriptors (no Playwright imports)
- [ ] `main/functions/` files contain ONLY page-object classes that consume the locators
- [ ] `main/utils/` files are unchanged from the scaffold (except `page.manager.ts` getters added later by `/generate-test`)


## 4. Code conventions (per page object)
- [ ] File header comment present on every `.ts` file under `main/` and `tests/`
- [ ] One-line JSDoc on every public method
- [ ] Class name is lowercase singular (`loginPage`, not `LoginPage`)
- [ ] Public methods are `snake_case` (`enter_username`, `verify_error`)
- [ ] One `Locator` property per UI element actually used
- [ ] Every public method body:
 - [ ] Wrapped in `await test.step('...', async () => { ... })`
 - [ ] `this.logger.info(...)` before AND after the work
 - [ ] At least one `this.screenshot.captureStep(...)` on state changes
 - [ ] No raw `page.locator(...)` calls (must use the locator class)


## 5. Locator quality (per page)
- [ ] Locators use `getByRole` first; XPath only with a `// why` comment
- [ ] No `// TODO:` placeholders remain — or those that do are tracked for the next iteration
- [ ] Locator property names describe the element type (`submitButton`, `errorBanner`)


## 6. Spec quality (per file under tests/)
- [ ] One feature per file; one `test()` per scenario
- [ ] Tags applied: `@smoke` for happy paths, `@regression` for negatives / edges / data variants
- [ ] `test.beforeEach` handles common setup (navigation + cookie modal)
- [ ] Each `test()` reads top-to-bottom like the manual test case it represents


## 7. Reporters
- [ ] HTML report opens via `npm run report:open`
- [ ] Allure works: `npm run test:run_all_allure` produces `./allure-report/`
- [ ] JUnit XML produced at `test-results/junit-report.xml`


## 8. CI readiness
- [ ] `.gitlab-ci.yml` references the right image and stages
- [ ] `Dockerfile` builds: `docker compose up --build`
- [ ] `.gitignore` excludes `node_modules/`, `test-results/`, `playwright-report/`, `allure-*/`, `.env`


## 9. Common changes still required
| Item | File | Notes |
|---|---|---|
| Real `BASE_URL` | `.env` | Per-environment value |
| Real credentials (base64) | `data/user.json` | Or wire to a vault |
| Replace TODO placeholder locators | `main/locators/*.ts` | After first live MCP run |
| Project-specific run notes | `README.md` | Replace template content |
| Authors / owners | `README.md` | Add team members |


## 10. Sign-off
- Reviewer: ______________________
- Date: __________________________
- Result: ☐ Ready for use   ☐ Changes requested (see notes below)
- Notes:


````

---

## 7 — PLACEHOLDER RULE

The reference home page and all generated files are placeholders by design:
- Realistic mock content so the framework type-checks and runs as a dry run.
- Each placeholder property carries a single-line `// TODO: ...` comment explaining what to replace.
- `data/user.json` uses sample base64 (`user` / `password`) — never real credentials.
- Placeholder locators are role-based so QA can swap them in place without restructuring.

---

## 8 — POST-CHECKS  *(must pass before reporting done)*

```bash
cd <target> && npx tsc --noEmit
cd <target> && npx playwright test --list
```

If `tsc` fails, fix the offending file and re-run. If `playwright test --list` doesn't list the sample spec, fix and re-run.

---

## 9 — GENERATION REPORT  *(mandatory final output)*

```
GENERATION REPORT — <target>
Files written:   <N>
tsc --noEmit:    <PASS | FAIL — first 10 lines of error>
playwright list: <PASS | FAIL — N specs discovered>
Convention audit:
 lowercase singular classes:  <PASS | FAIL>
 snake_case methods:          <PASS | FAIL>
 locators separated:          <PASS | FAIL>
 test.step in every method:   <PASS | FAIL>
 logger.info before+after:    <PASS | FAIL>
 no page.locator in main/functions/: <PASS | FAIL>
 file header comment on every .ts:   <PASS | FAIL>
 one-line JSDoc on every public method: <PASS | FAIL>
Placeholders left:  <count>  (paths — expected; QA replaces during first live run)
Next steps:         cd <target> && npm install && npx playwright install --with-deps && npm test
```

If any row is `FAIL`, fix and re-run before reporting "done".

---

## 10 — COMMUNICATION STYLE

> See CLAUDE.md — house standard applies.

---

## BEGIN
Run §2 (target check), print §3 (plan), wait for approval.
