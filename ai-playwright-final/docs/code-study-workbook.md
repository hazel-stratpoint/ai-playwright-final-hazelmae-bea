# Code Study Workbook: Building This Framework by Hand

The `capstone-study-guide.md` explains *what the framework is and does*. This workbook teaches you to **write the code yourself**: features, step definitions, locators, page-object methods, and utilities.

Work through it in order. Do not just read the example code — type every exercise yourself, then run the self-check before opening `code-study-workbook-solutions.md`.

---

## 0. How to use this workbook

### The learning loop

For every layer you will follow the same loop:

1. **Read** the annotated real code (taken from your repo).
2. **Do** the exercise in your editor.
3. **Check** with the commands in this workbook.
4. **Compare** only afterwards against `code-study-workbook-solutions.md`.
5. **Explain** the layer back in your own words. If you cannot, redo it.

### Two tracks

- **Track A — Rebuild existing pieces.** You re-implement things that already exist against the training site so you can diff your version against a known-good one.
- **Track B — Build a brand-new feature.** You build every layer for a *new* page (`practice-site.html`) from an empty slate.

### Command cheat sheet

Run all of these from the `ai-playwright-final/` directory.

```bash
npm run typecheck                 # TypeScript compiles
npm run test:dry-run              # all features load + all steps resolve (no browser)
npx cucumber-js --name "ST-003"   # run one scenario by its name
npm run test:smoke                # @smoke set
npm run test:headed               # watch the browser
npm run test:practice             # Track B suite (you create this profile)
```

> **Golden rule:** never invent a selector. Open the real page and confirm it. A guessed selector that happens to pass teaches you nothing and breaks silently later.

### Before you start (one-time setup)

```bash
cd ai-playwright-final
cp .env.example .env
npx playwright install chromium
npm run typecheck && npm run test:dry-run
```

Expected: `typecheck` prints nothing, `dry-run` exits `0`.

---

## 1. The mental model: one sentence travels down one chain

Every scenario is one sentence traveling through five files:

```text
features/*.feature          "business language"
   -> step-definitions/*.ts   Gherkin sentence -> one method call
      -> main/utils/page.manager.ts   which page object to use
         -> main/functions/*.ts        the action/assertion (the automation API)
            -> main/locators/*.ts      the verified selector
               -> Playwright talks to the browser
main/utils/world.ts + hooks.ts         create/dispose the browser per scenario
cucumber.js                            reports
```

Each layer has exactly **one job** and must not do the next layer's job:

| Layer | Owns | Must NOT contain |
| --- | --- | --- |
| Feature | User-visible behavior, test IDs, tags | selectors, Playwright calls, class names |
| Step definition | Mapping sentence → method, parameter types | selectors, assertions, `page.*` calls, sleeps |
| Locator module | Named, verified selectors | actions, assertions, business logic |
| POM method | One action **or** one assertion, logging | CSS strings scattered inline |
| Utils | Lifecycle, logging, screenshots, registry | page-specific selectors or assertions |

**Exercise A1 (concept).** For `[ST-006] Filter Table by Name` in `features/data-display.feature`, write the chain by hand: list the exact feature sentence, the matching step expression, the POM method name, and every `trainingSiteLocators` key it uses. You are done when you can point to a `file:line` for each.

---

## 2. Layer 1 — Feature files (Gherkin)

### What it is

A `.feature` file is a plain-text test case readable by a non-programmer. Cucumber parses it, then looks for a step definition matching each line.

### Annotated real example

`features/interactions.feature` (ST-003):

```gherkin
Feature: Training site interactions          # groups related behavior
  As a visitor ...                            # optional user-story framing
  I want to ...
  So that ...

  @smoke                                       # tag = selection metadata
  Scenario: [ST-003] Increment and Reset Counter   # [ST-003] is the traceable case ID
    Given I am on the "Buttons & Interactions" section   # context, with {string} param
    When I increment the counter 5 times                 # action, with {int} param
    Then the counter displays "5"                        # observable outcome
    When I reset the counter
    Then the counter displays "0"
```

### Rules

1. **Keywords mean intent:** `Given` = precondition, `When` = action, `Then` = observable outcome, `And`/`But` continue the previous kind.
2. **One case ID per scenario,** kept in the title: `[ST-003]`. It shows up in reports.
3. **Tags select runs:** `@smoke`, `@regression`. They are metadata, not test steps.
4. **Business language only.** If a sentence mentions `#id`, `click`, `div`, or a class name, it does not belong here.
5. **Deterministic and independent.** A scenario should not depend on another running first.

### Exercise A2 (Track A)

Create a new file `features/practice-counter.feature`. Add one scenario `[ST-P01] Increment Three Times Then Reset` that:

- is tagged `@smoke`,
- goes to the `"Buttons & Interactions"` section,
- increments the counter `3` times,
- verifies it displays `"3"`,
- resets,
- verifies it displays `"0"`.

Reuse existing step sentences only — do not add any new step definitions yet.

### Self-check

```bash
npx cucumber-js --name "ST-P01" --dry-run
```

This must not report an "undefined step". It will not open a browser yet (dry-run). Inspect it, then move on.

---

## 3. Layer 2 — Step definitions

### What it is

A step definition is the bridge. It matches one Gherkin sentence and calls exactly one POM method with the captured parameters.

### Annotated real example

`step-definitions/training-site.steps.ts`:

```ts
import { Given, Then, When } from "@cucumber/cucumber";
import type { TestWorld } from "main/utils/world";

// "When I increment the counter 5 times"  ->  {int} captures "5" as a number
When(
  "I increment the counter {int} times",
  async function (this: TestWorld, times: number) {
    await this.pages.training_site.increment_counter(times);  // delegate, one line
  }
);

Then(
  "the counter displays {string}",          // {string} captures quoted text
  async function (this: TestWorld, value: string) {
    await this.pages.training_site.verify_counter_value(value);  // delegate, one line
  }
);
```

### Cucumber expression parameter types

| Token | Matches | JavaScript type |
| --- | --- | --- |
| `{string}` | text in double or single quotes | `string` (quotes removed) |
| `{int}` | whole number | `number` |
| `{float}` | decimal number | `number` |
| `{word}` | one word, no spaces | `string` |

### Rules

1. **Thin binding only.** Get parameters, call one method. Nothing else.
2. **No selectors, no `page.*`, no assertions, no sleeps, no `if` business logic** inside a step. The one exception in the repo is a card-name guard in `training-site.steps.ts:151` — notice it only validates input, it does not touch the browser.
3. **Type `this` as `TestWorld`** so `this.pages` is typed.
4. **One method per step.** If a sentence needs two actions, either write two sentences or one workflow method in the POM (e.g. `fill_valid_registration`).

### Exercise A3 (Track A)

Write a step binding for this new sentence, delegating to `increment_counter(1)`:

```
When I click the increment button once
```

Put it in `step-definitions/training-site.steps.ts`. Then explain in a sentence: why might a team prefer to reuse `"I increment the counter 1 times"` instead of adding this new sentence?

### Exercise A4 (Track A)

Open `step-definitions/training-site.steps.ts`. Find the step for `"I submit the empty registration form"`. Notice it calls `submit_registration()` — the *same* method as the valid flow. Explain why that is correct: what makes the two registration scenarios behave differently if the step is identical?

### Self-check

```bash
npm run typecheck
npm run test:dry-run
```

Both must pass. A duplicate/ambiguous expression will fail the dry-run.

---

## 4. Layer 3 — Locators

### What it is

A locator module is the single named home for selectors. Page objects import names from it instead of repeating raw strings.

### Annotated real example

`main/locators/trainingSiteLocators.ts`:

```ts
export const trainingSiteLocators = {
  sections: {
    "Login Form": "#section-login",           // section anchors, used to scroll to an area
    // ...
  },
  login: {
    email: "#login-email",
    password: "#login-password",
    submit: "#login-submit",
    message: "#login-message"
  },
  registration: {
    webInterest: '[data-testid="interest-web"]',
    beginnerExperience: 'input[name="experience"][value="beginner"]',
    // ...
  },
  // ...counter, hiddenButton, tabs, table, alerts, modal, delayedContent, dragAndDrop, iframe
} as const;

export type TrainingSection = keyof typeof trainingSiteLocators.sections;
export type TrainingTab = keyof typeof trainingSiteLocators.tabs;
```

Three things to learn from this file:

1. **Grouping by feature area** (`login`, `table`, `modal`) keeps ownership clear. A locator belongs to the page object that understands its meaning.
2. **`as const` + derived types.** `as const` makes the values literal, and `keyof typeof` derives `TrainingSection` / `TrainingTab`, which lets POM methods validate named inputs (`trainingSiteMethods.ts:12`, `:160`).
3. **Strategy varies by element.** `#login-email` is an ID; `[data-testid="interest-web"]` is a test ID; `input[name="experience"][value="beginner"]` is an attribute selector; `#table-body tr` is a scoped structural selector.

### Locator preference ladder (best → worst)

1. Accessible **role + name** — `getByRole("button", { name: "Sign In" })`.
2. **Label / placeholder** for correctly associated form fields.
3. **Test ID** — a deliberate automation contract.
4. **Stable ID or simple CSS** that reflects a real, verified selector.
5. **XPath** — last resort; document why.

Prefer the highest rung the page actually supports. The training site exposes stable IDs and `data-testid`s, so this project uses those.

### Exercise A5 (Track A — analysis)

For each locator below, name its strategy and say whether it is *global* or *scoped*:

| Locator | Strategy? | Global or scoped? |
| --- | --- | --- |
| `login.email` = `#login-email` | ? | ? |
| `registration.webInterest` = `[data-testid="interest-web"]` | ? | ? |
| `beginnerExperience` = `input[name="experience"][value="beginner"]` | ? | ? |
| `table.rows` = `#table-body tr` | ? | ? |
| `alerts.banners` = `#alerts-container .alert` | ? | ? |

### Exercise A6 (Track A — judgment)

`registration.webInterest` uses `data-testid`, while `beginnerExperience` uses `input[name=...][value=...]`. Which is the more robust automation contract, and what could make the other one fragile? Then: why must you *verify against the real page* before "improving" either one?

### Self-check

There is no runnable self-check for pure analysis. For coding exercises in this layer, `npm run typecheck` confirms the module compiles and derived types resolve.

---

## 5. Layer 4 — Page-object methods (the automation API)

### What it is

`main/functions/*.ts` is where browser work lives. Each public method is either **one action** or **one assertion**, named in `snake_case`, and wrapped in `run_action` for logging.

### Annotated real example

`main/functions/trainingSiteMethods.ts`:

```ts
export class trainingSiteMethods {
  constructor(private readonly page: Page) {}

  /** Increment the counter the requested number of times. */
  async increment_counter(times: number): Promise<void> {
    await this.run_action("increment_counter", async () => {
      if (!Number.isInteger(times) || times < 1) {           // guard inputs
        throw new Error(`Counter increment count must be a positive integer; received "${times}".`);
      }
      const incrementButton = this.page.locator(trainingSiteLocators.counter.increment);
      for (let click = 0; click < times; click += 1) {
        await incrementButton.click();                        // auto-waiting action
      }
    });
  }

  /** Verify the counter's displayed value. */
  async verify_counter_value(value: string): Promise<void> {
    await this.run_action("verify_counter_value", async () => {
      await expect(this.page.locator(trainingSiteLocators.counter.value)).toHaveText(value); // web-first assertion
    });
  }

  private async run_action<T>(name: string, action: () => Promise<T>): Promise<T> {
    logger.info("POM action started", { method: name });
    try {
      const result = await action();
      logger.info("POM action completed", { method: name });
      return result;
    } catch (error) {
      logger.error("POM action failed", { method: name, error: /* ... */ });
      throw error;                                            // never swallow errors
    }
  }
}
```

### Rules

1. **One responsibility per method.** `fill_valid_registration` is the permitted exception: a named *workflow* that fills many fields.
2. **Actions vs assertions are separate methods.** `increment_counter` acts; `verify_counter_value` asserts.
3. **Use Playwright auto-waiting and web-first assertions** (`toHaveText`, `toBeVisible`, `toHaveCount`) instead of `waitForTimeout` / sleeps.
4. **Always log through `run_action`**, and **always rethrow.** Never `catch` and return a fake success.
5. **Locators come from the locator module**, never inline strings.
6. **Guard inputs early** and throw a descriptive error (see the counter guard, or the `sections`/`tabs` lookups at `:12` and `:160`).

### Exercise A7 (Track A — reimplement)

In a scratch file, reimplement `toggle_hidden_button()` and `verify_hidden_button_visibility(visible: boolean)` from scratch:

- toggle clicks `trainingSiteLocators.hiddenButton.toggle`;
- verify asserts `toBeVisible()` when `visible` is true, else `toBeHidden()`;
- both wrapped in `run_action`.

Then compare with the real implementation at `trainingSiteMethods.ts:139` and `:146`.

### Exercise A8 (Track A — workflow method)

Write a workflow method `sign_in_with(role: string)` (not present in the repo) that, for `role === "admin"`, calls `sign_in("admin@example.com", "admin-pass")`, and for anything else throws a descriptive "unsupported role" error. This practices the input-guard pattern used by `navigate_to_section`.

### Self-check

```bash
npm run typecheck
npx cucumber-js --name "ST-004" --dry-run
npm run test:headed -- --name "ST-004"     # watch the toggle happen twice
```

---

## 6. Layer 5 — Utilities: World, hooks, PageManager, logger, screenshot

These files run *around* your scenarios.

### `main/utils/world.ts` — per-scenario state

```ts
export class TestWorld extends World {
  context?: BrowserContext;
  page?: Page;
  private manager?: PageManager;

  async start(browser: Browser): Promise<void> {
    this.context = await browser.newContext();      // fresh, isolated context
    this.page = await this.context.newPage();
    this.manager = new PageManager(this.page);      // registry bound to THIS page
  }

  get pages(): PageManager {
    if (!this.manager) throw new Error("PageManager is unavailable; the Cucumber Before hook did not run.");
    return this.manager;
  }

  async dispose(): Promise<void> {
    await this.context?.close();
    this.context = this.page = this.manager = undefined;
  }
}
setWorldConstructor(TestWorld);
```

**Key idea:** scenario state lives on the `this` World, never in module-level variables. One browser is shared; every scenario gets a new `BrowserContext`.

### `main/utils/page.manager.ts` — lazy page registry

```ts
export class PageManager {
  private trainingSiteInstance?: trainingSiteMethods;
  constructor(private readonly page: Page) {}

  get training_site(): trainingSiteMethods {
    this.trainingSiteInstance ??= new trainingSiteMethods(this.page);  // build on first use
    return this.trainingSiteInstance;
  }
}
```

A page object is created only when a step first touches it, and it always receives the current scenario's page.

### `main/utils/hooks.ts` — lifecycle

```ts
BeforeAll  -> validate BASE_URL + BROWSER, launch ONE browser process
Before     -> log scenario start, call this.start(browser)  (new context/page)
After      -> on failure, screenshot + attach; always this.dispose()
AfterAll   -> close the shared browser
```

Failure evidence (`hooks.ts:53`) only runs when `result.status === Status.FAILED`, and only if the page is still open.

### `main/utils/logger.ts` and `main/utils/screenshot.ts`

- `logger` is a Winston logger with console + file transports; every POM action logs start/complete/fail.
- `save_failure_screenshot` sanitizes the scenario name, writes a full-page PNG under `test-results/screenshots/`, and returns the buffer for Cucumber to attach.

### Exercise A9 (Track A — trace)

Write the exact lifecycle order for a **failing** scenario, from process start to process end. Include: `BeforeAll`, browser launch, `Before`, `start`, each step, `After`, screenshot capture, `attach`, `dispose`, `AfterAll`, browser close. Mark the point where the screenshot is taken relative to `dispose`.

### Exercise A10 (Track A — extend)

Add a lazy getter `practice` to `PageManager` that returns a `practicePage` built from `this.page`. (You will implement `practicePage` in Track B; for now just wire the getter and accept a type error until then, or do this exercise after B3.)

---

## 7. Layer 6 — Configuration wiring

### `cucumber.js`

```js
const common = {
  paths: ["features/**/*.feature"],
  requireModule: ["ts-node/register", "tsconfig-paths/register", "dotenv/config"],
  require: ["main/utils/**/*.ts", "step-definitions/**/*.ts"],
  format: ["progress", "html:reports/cucumber-report.html", "allure-cucumberjs/reporter"],
  formatOptions: { resultsDir: "allure-results" },
  publishQuiet: true
};

module.exports = {
  default:    { ...common, tags: "not @scaffold and not @demo-failure" },
  smoke:      { ...common, tags: "@smoke and not @scaffold and not @demo-failure" },
  regression: { ...common, tags: "@regression and not @scaffold and not @demo-failure" },
  scaffold:   { ...common, tags: "@scaffold" },
  "demo-failure": { ...common, tags: "@demo-failure" },
  "dry-run":  { ...common, dryRun: true }
};
```

`requireModule` is what lets TypeScript and the `main/*` import alias work at runtime. `require` tells Cucumber where your steps and World/hooks live. **Profiles only change tags — never duplicate runner wiring.**

### Other config files

- `tsconfig.json`: `strict`, `module: Node16`, and `"paths": { "main/*": ["./main/*"] }` — this is why `import ... from "main/utils/logger"` works.
- `package.json`: every profile gets a script. Browser scripts use `cross-env BROWSER=...`.
- `.env`: `BASE_URL` and `BROWSER`. Never committed.

### Exercise A11 (Track A)

Explain why `requireModule` includes `tsconfig-paths/register`. Then explain what would break if you removed `"main/utils/**/*.ts"` from `require`.

---

## 8. Track B capstone — build a brand-new feature end to end

Now build every layer from scratch for a local page. This is the exam for everything above.

### B1. Create the practice page

Create `practice/practice-site.html` with exactly this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Practice Site</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; }
    section { border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    #greeting-output { margin-top: .5rem; font-weight: 600; }
    .hidden { display: none; }
    body[data-theme="dark"] { background: #111; color: #eee; }
  </style>
</head>
<body>
  <h1>Practice Site</h1>

  <section id="section-greet">
    <h2>Greeting</h2>
    <label for="name-input">Your name</label>
    <input id="name-input" type="text" />
    <button id="greet-button" type="button">Greet</button>
    <p id="greeting-output" class="hidden" data-testid="greeting-output"></p>
  </section>

  <section id="section-todos">
    <h2>Todos</h2>
    <label for="todo-input">New todo</label>
    <input id="todo-input" type="text" />
    <button id="add-todo" type="button">Add</button>
    <ul id="todo-list"></ul>
    <p id="todo-count" data-testid="todo-count">0 todos</p>
  </section>

  <section id="section-theme">
    <h2>Theme</h2>
    <button id="toggle-theme" type="button">Toggle theme</button>
  </section>

  <script>
    let todoCount = 0;
    const greetingOutput = document.getElementById("greeting-output");

    document.getElementById("greet-button").addEventListener("click", () => {
      const name = document.getElementById("name-input").value.trim();
      greetingOutput.textContent = name ? `Hello, ${name}!` : "Hello, stranger!";
      greetingOutput.classList.remove("hidden");
    });

    document.getElementById("add-todo").addEventListener("click", () => {
      const input = document.getElementById("todo-input");
      const text = input.value.trim();
      if (!text) return;
      const li = document.createElement("li");
      li.className = "todo-item";
      li.setAttribute("data-testid", "todo-item");
      li.textContent = text;
      document.getElementById("todo-list").appendChild(li);
      todoCount += 1;
      document.getElementById("todo-count").textContent = `${todoCount} todos`;
      input.value = "";
    });

    document.getElementById("toggle-theme").addEventListener("click", () => {
      const body = document.body;
      body.setAttribute("data-theme", body.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  </script>
</body>
</html>
```

### B2. Locators — `main/locators/practiceLocators.ts`

Create a module `practiceLocators` with three groups: `greeting`, `todos`, `theme`. Use verified selectors from the HTML (`#name-input`, `[data-testid="greeting-output"]`, `[data-testid="todo-item"]`, `body`, etc.). Add `as const`.

### B3. Methods — `main/functions/practiceMethods.ts`

Create `export class practicePage` with a `page` constructor field and a private `run_action`, then implement:

| Method | Behavior |
| --- | --- |
| `open_practice_site()` | `goto` the `BASE_URL` with `waitUntil: "domcontentloaded"`, validating `BASE_URL` like `trainingSiteMethods.navigate_to_section` |
| `enter_name(name)` | fill the name input |
| `click_greet()` | click greet |
| `verify_greeting(text)` | `toContainText(text)` on the greeting output |
| `verify_greeting_hidden()` | `toBeHidden()` on the greeting output |
| `add_todo(text)` | fill the todo input and click add |
| `verify_todo_count(text)` | `toHaveText(text)` on the count |
| `verify_todo_items(count)` | `toHaveCount(count)` on the todo items |
| `toggle_theme()` | click the theme toggle |
| `verify_theme(theme)` | `toHaveAttribute("data-theme", theme)` on `body` |

Every method goes through `run_action` and uses only `practiceLocators`.

### B4. Register the page — `main/utils/page.manager.ts`

Add a `practice` getter (Exercise A10 if you have not done it yet) returning a lazily built `practicePage`.

### B5. Steps — `step-definitions/practice.steps.ts`

Bind these sentences, each delegating to one method:

```
Given I open the practice site
Given I am on the practice greeting section
Given I am on the practice todo section
Given I am on the practice theme section
When I enter the name {string}
When I click greet
Then the greeting shows {string}
Then the practice greeting is hidden
When I add the todo {string}
Then the practice todo count is {string}
Then the practice todo list has {int} items
When I toggle the practice theme
Then the practice page theme is {string}
```

> Hint: several `Given ... section` sentences can all call `open_practice_site()` when they first need the page. Or make one call `open_practice_site()` and have the others be no-ops that just assert the section exists. Pick a design and justify it.

### B6. Feature — `features/practice.feature`

Write a feature tagged `@practice` (tag every scenario `@practice` only) with:

- `[PB-001]` greeting shows the entered name
- `[PB-002]` adding two todos updates the count to `2 todos` and the list to 2 items
- `[PB-003]` greeting is hidden before the first click
- `[PB-004]` toggling the theme sets `body[data-theme="dark"]`

> **Isolation trap:** if you *also* tag them `@smoke`, they will run in `test:smoke`, because that profile selects `"@smoke and not @scaffold and not @demo-failure"`. To keep them separate, either tag `@practice` only, or add `and not @practice` to the other profiles. Decide and justify.

### B7. Config — `cucumber.js` and `package.json`

1. Add a `practice` profile: `{ ...common, tags: "@practice" }`.
2. Update `default` so it **excludes** practice: `"not @scaffold and not @demo-failure and not @practice"`.
3. Add scripts:

```json
"practice:serve": "http-server practice -p 9339",
"test:practice": "cross-env BASE_URL=http://127.0.0.1:9339/practice-site.html BROWSER=chromium cucumber-js --profile practice"
```

### B8. Run it

```bash
# terminal 1
npm run practice:serve

# terminal 2
npm run typecheck
npm run test:practice
```

All four practice scenarios must pass. Then run `npm test` and confirm the main 15-case suite is unaffected.

### Track B acceptance checklist

- [ ] `npm run typecheck` is clean.
- [ ] `npm run test:dry-run` shows no undefined steps.
- [ ] `npm run test:practice` passes 4 scenarios.
- [ ] `npm test` still excludes the practice tag.
- [ ] No selector appears in a step definition or a feature file.
- [ ] Deleting `main/functions/practiceMethods.ts` would break only compile, not the feature text.

---

## 9. Debugging playbook

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Undefined. Implement with the following snippet` | no step matches the sentence | add/repair the expression; check `{string}` vs `{int}` |
| `Multiple step definitions match` | two expressions too similar | make expressions more specific |
| `PageManager is unavailable` | `Before` hook did not run | check `require` globs in `cucumber.js` |
| `locator.click: Timeout` | wrong selector or element not interactable | verify the selector in the live page; check for overlay/iframe |
| `expect(...).toHaveText` times out | assertion text mismatch or async content | confirm exact text; increase the assertion timeout, never sleep |
| Drag-and-drop does nothing | target not ready | see the retry loop at `trainingSiteMethods.ts:295` |
| `BASE_URL is required` | missing `.env` | `cp .env.example .env` |

**Evidence workflow:** on failure the `After` hook writes `test-results/screenshots/*.png` and attaches it to the report. Open `reports/cucumber-report.html` (via `npm run report:html:open`) to see the failing step, the assertion, and the attached screenshot. Read `logs/test-run.log` for the ordered POM action log.

---

## 10. Exercise index

| ID | Layer | Track | Skill |
| --- | --- | --- | --- |
| A1 | Concept | A | Trace the execution chain |
| A2 | Feature | A | Write a Gherkin scenario |
| A3 | Step | A | Bind a sentence |
| A4 | Step | A | Explain shared vs distinct flows |
| A5 | Locator | A | Classify strategies |
| A6 | Locator | A | Judge robustness |
| A7 | POM | A | Reimplement methods |
| A8 | POM | A | Write a workflow + guard |
| A9 | Utils | A | Trace lifecycle |
| A10 | Utils | A | Extend PageManager |
| A11 | Config | A | Explain runtime wiring |
| B1–B8 | All | B | Build a full feature from scratch |

Model answers and complete Track B code are in `code-study-workbook-solutions.md`. Try each exercise before you look.
