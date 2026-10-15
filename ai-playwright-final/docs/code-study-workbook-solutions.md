# Code Study Workbook — Solutions

Open this only **after** attempting the matching exercise in `code-study-workbook.md`. Reading a solution you did not attempt teaches almost nothing.

---

## A1 — Execution chain for `[ST-006] Filter Table by Name`

| Feature sentence | Step expression (`training-site.steps.ts`) | POM method (`trainingSiteMethods.ts`) | Locator keys (`trainingSiteLocators.ts`) |
| --- | --- | --- | --- |
| `Given I am on the "Sortable Data Table" section` | `I am on the {string} section` | `navigate_to_section` | `sections["Sortable Data Table"]` → `getByRole("heading", { name: "Sortable Data Table" })` |
| `Then the table initially shows 8 users` | `the table initially shows 8 users` | `verify_initial_table` | `table.rows` → `getByTestId("table-body").getByRole("row")`, `table.count` → `getByTestId("table-count")` |
| `When I filter the table by "Alice"` | `I filter the table by {string}` | `filter_table` | `table.search` → `getByRole("searchbox", { name: "Filter rows..." })` |
| `Then only 1 row containing "Alice Chen" is shown` | `only 1 row containing {string} is shown` | `verify_single_table_row` | `table.rows` → `getByTestId("table-body").getByRole("row")` |

`navigate_to_section` resolves the section name to its heading locator, navigates to `BASE_URL`, and scrolls that heading into view.

---

## A2 — `features/practice-counter.feature`

```gherkin
Feature: Practice counter
  As a learner
  I want to rebuild an existing scenario from scratch
  So that I understand features, steps, and methods

  @smoke
  Scenario: [ST-P01] Increment Three Times Then Reset
    Given I am on the "Buttons & Interactions" section
    When I increment the counter 3 times
    Then the counter displays "3"
    When I reset the counter
    Then the counter displays "0"
```

All four sentences already have step definitions, so no new bindings are needed. Run it with `npx cucumber-js --name "ST-P01"`.

---

## A3 — New step binding

```ts
When("I click the increment button once", async function (this: TestWorld) {
  await this.pages.training_site.increment_counter(1);
});
```

**Why prefer reusing `"I increment the counter 1 times"`?** The quantity is *data*, not new behavior. Reusing the existing `{int}` sentence keeps one vocabulary, one code path, and less maintenance. A separate sentence is only justified if the UI genuinely exposes a distinct control with distinct behavior.

---

## A4 — Why one `submit_registration()` serves two scenarios

The submit step is identical, but the **precondition** differs:

- Valid flow: `When I complete registration with valid details` runs `fill_valid_registration()` first, so the form has data and submitting succeeds.
- Empty flow: nothing is filled, so submitting produces validation errors.

The *outcome assertion* is also selected per scenario (`verify_registration_success` vs `verify_registration_errors`). This is good design: the action is shared, the state and the assertion distinguish the cases.

---

## A5 — Locator strategies

| Locator | Strategy | Scope |
| --- | --- | --- |
| `getByPlaceholder("test@example.com")` | accessible placeholder | global |
| `getByRole("checkbox", { name: "Web Testing" })` | accessible role/name | global |
| `getByRole("radio", { name: "Beginner" })` | accessible role/name | global |
| `getByTestId("table-body").getByRole("row")` | test ID + accessible role | scoped to the table body |
| `getByTestId("alerts-container").locator(".alert")` | scoped class CSS | scoped to the alerts container |

The last two are *scoped* because `getByTestId("table-body")` and `getByTestId("alerts-container")` restrict the query to one area.

---

## A6 — Robustness judgment

- The named checkbox and radio locators use user-facing accessible names, so they remain clear and avoid relying on implementation-specific attributes.
- The table and alert locators scope their queries to a stable container, avoiding unrelated rows or alerts elsewhere on the page.
- You must verify against the live page because the site's real markup is the source of truth. "Improving" a working selector from an assumption risks breaking a passing test for no measurable gain.

---

## A7 — Reimplemented toggle/verify methods

```ts
async toggle_hidden_button(): Promise<void> {
  await this.run_action("toggle_hidden_button", async () => {
    await this.locators.hiddenButton.toggle.click();
  });
}

async verify_hidden_button_visibility(visible: boolean): Promise<void> {
  await this.run_action("verify_hidden_button_visibility", async () => {
    const target = this.locators.hiddenButton.target;
    if (visible) {
      await expect(target).toBeVisible();
    } else {
      await expect(target).toBeHidden();
    }
  });
}
```

Compare with `trainingSiteMethods.ts:139` and `:146` — this matches the real implementation.

---

## A8 — Workflow method with an input guard

```ts
/** Sign in with the account associated with a supported role. */
async sign_in_with(role: string): Promise<void> {
  await this.run_action("sign_in_with", async () => {
    if (role !== "admin") {
      throw new Error(`Unsupported sign-in role: "${role}".`);
    }
    await this.sign_in("admin@example.com", "admin-pass");
  });
}
```

Note: calling `this.sign_in` nests a second `run_action` log entry. That is acceptable and often desirable; if you want a single log line, inline the three locator calls instead.

---

## A9 — Lifecycle of a failing scenario

1. **Process start** — Cucumber loads `requireModule` and all `require` globs (`world.ts`, `hooks.ts`, steps).
2. **`BeforeAll`** — validate `BASE_URL` and `BROWSER`; launch **one** browser process.
3. **`Before`** — log "Scenario started"; `world.start(browser)` → `newContext()`, `newPage()`, `new PageManager(page)`.
4. **Steps run in order** — a step fails (throws).
5. **`After`** — `result.status === Status.FAILED` and page still open → `save_failure_screenshot()` writes a PNG → `this.attach(buffer, "image/png")`. **Screenshot happens before dispose.**
6. **`finally` in `After`** — log "Scenario finished"; `world.dispose()` → `context.close()`; clear `context`/`page`/`manager`.
7. Steps 3–6 repeat for each scenario.
8. **`AfterAll`** — `browser.close()`; clear the reference.

---

## A10 / B4 — Extend `PageManager`

Add to `main/utils/page.manager.ts`:

```ts
import { practicePage } from "main/functions/practiceMethods";

export class PageManager {
  private homePageInstance?: homePage;
  private trainingSiteInstance?: trainingSiteMethods;
  private practiceInstance?: practicePage;

  constructor(private readonly page: Page) {}

  // ...existing getters...

  /** Return the lazily constructed practice-site page object. */
  get practice(): practicePage {
    this.practiceInstance ??= new practicePage(this.page);
    return this.practiceInstance;
  }
}
```

---

## A11 — Runtime wiring

- `tsconfig-paths/register` installs a runtime hook so imports using the `main/*` alias (defined in `tsconfig.json`) resolve when `ts-node` executes TypeScript directly. Without it, `import ... from "main/utils/logger"` would fail at runtime with "Cannot find module".
- Removing `"main/utils/**/*.ts"` from `require` means `world.ts` and `hooks.ts` never load. `setWorldConstructor(TestWorld)` and the `Before`/`After` hooks would never register, so `this.pages` would be undefined and no browser context would be created.

---

# Track B — Complete reference implementation

## B1 — `practice/practice-site.html`

Use exactly the HTML in the workbook (section B1). No changes are needed.

## B2 — `main/locators/practiceLocators.ts`

```ts
/** Verified selectors for the local practice site. */
export const practiceLocators = {
  greeting: {
    nameInput: "#name-input",
    greetButton: "#greet-button",
    output: '[data-testid="greeting-output"]'
  },
  todos: {
    input: "#todo-input",
    addButton: "#add-todo",
    items: '[data-testid="todo-item"]',
    count: '[data-testid="todo-count"]'
  },
  theme: {
    toggle: "#toggle-theme",
    body: "body"
  }
} as const;
```

## B3 — `main/functions/practiceMethods.ts`

```ts
/** Page actions and assertions for the local practice site. */
import { expect, type Page } from "@playwright/test";
import { logger } from "main/utils/logger";
import { practiceLocators } from "main/locators/practiceLocators";

export class practicePage {
  constructor(private readonly page: Page) {}

  /** Open the configured practice page. */
  async open_practice_site(): Promise<void> {
    await this.run_action("open_practice_site", async () => {
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

  /** Type a name into the greeting input. */
  async enter_name(name: string): Promise<void> {
    await this.run_action("enter_name", async () => {
      await this.page.locator(practiceLocators.greeting.nameInput).fill(name);
    });
  }

  /** Click the greet button. */
  async click_greet(): Promise<void> {
    await this.run_action("click_greet", async () => {
      await this.page.locator(practiceLocators.greeting.greetButton).click();
    });
  }

  /** Verify the greeting output contains the supplied text. */
  async verify_greeting(text: string): Promise<void> {
    await this.run_action("verify_greeting", async () => {
      await expect(this.page.locator(practiceLocators.greeting.output)).toContainText(text);
    });
  }

  /** Verify the greeting output is hidden. */
  async verify_greeting_hidden(): Promise<void> {
    await this.run_action("verify_greeting_hidden", async () => {
      await expect(this.page.locator(practiceLocators.greeting.output)).toBeHidden();
    });
  }

  /** Add one todo item. */
  async add_todo(text: string): Promise<void> {
    await this.run_action("add_todo", async () => {
      await this.page.locator(practiceLocators.todos.input).fill(text);
      await this.page.locator(practiceLocators.todos.addButton).click();
    });
  }

  /** Verify the todo count text. */
  async verify_todo_count(text: string): Promise<void> {
    await this.run_action("verify_todo_count", async () => {
      await expect(this.page.locator(practiceLocators.todos.count)).toHaveText(text);
    });
  }

  /** Verify the number of rendered todo items. */
  async verify_todo_items(count: number): Promise<void> {
    await this.run_action("verify_todo_items", async () => {
      await expect(this.page.locator(practiceLocators.todos.items)).toHaveCount(count);
    });
  }

  /** Toggle the page theme. */
  async toggle_theme(): Promise<void> {
    await this.run_action("toggle_theme", async () => {
      await this.page.locator(practiceLocators.theme.toggle).click();
    });
  }

  /** Verify the body's data-theme attribute. */
  async verify_theme(theme: string): Promise<void> {
    await this.run_action("verify_theme", async () => {
      await expect(this.page.locator(practiceLocators.theme.body))
        .toHaveAttribute("data-theme", theme);
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

## B5 — `step-definitions/practice.steps.ts`

```ts
/** Thin Cucumber bindings for the local practice-site scenarios. */
import { Given, Then, When } from "@cucumber/cucumber";
import type { TestWorld } from "main/utils/world";

Given("I open the practice site", async function (this: TestWorld) {
  await this.pages.practice.open_practice_site();
});

Given("I am on the practice greeting section", async function (this: TestWorld) {
  await this.pages.practice.open_practice_site();
});

Given("I am on the practice todo section", async function (this: TestWorld) {
  await this.pages.practice.open_practice_site();
});

Given("I am on the practice theme section", async function (this: TestWorld) {
  await this.pages.practice.open_practice_site();
});

When("I enter the name {string}", async function (this: TestWorld, name: string) {
  await this.pages.practice.enter_name(name);
});

When("I click greet", async function (this: TestWorld) {
  await this.pages.practice.click_greet();
});

Then("the greeting shows {string}", async function (this: TestWorld, text: string) {
  await this.pages.practice.verify_greeting(text);
});

Then("the practice greeting is hidden", async function (this: TestWorld) {
  await this.pages.practice.verify_greeting_hidden();
});

When("I add the todo {string}", async function (this: TestWorld, text: string) {
  await this.pages.practice.add_todo(text);
});

Then("the practice todo count is {string}", async function (this: TestWorld, text: string) {
  await this.pages.practice.verify_todo_count(text);
});

Then("the practice todo list has {int} items", async function (this: TestWorld, count: number) {
  await this.pages.practice.verify_todo_items(count);
});

When("I toggle the practice theme", async function (this: TestWorld) {
  await this.pages.practice.toggle_theme();
});

Then("the practice page theme is {string}", async function (this: TestWorld, theme: string) {
  await this.pages.practice.verify_theme(theme);
});
```

**Design note:** the three "section" sentences all open the page. The practice page has no per-section anchors, so "being on a section" is just "the page is open". The unused `"I open the practice site"` sentence is a valid alternative entry point.

## B6 — `features/practice.feature`

```gherkin
@practice
Feature: Practice site interactions
  As a learner
  I want to automate a local practice page
  So that I can build every framework layer myself

  Scenario: [PB-001] Greeting Shows the Entered Name
    Given I am on the practice greeting section
    When I enter the name "Ada"
    And I click greet
    Then the greeting shows "Hello, Ada!"

  Scenario: [PB-002] Adding Todos Updates the Count
    Given I am on the practice todo section
    When I add the todo "Write locators"
    And I add the todo "Write steps"
    Then the practice todo count is "2 todos"
    And the practice todo list has 2 items

  Scenario: [PB-003] Greeting Is Hidden Before First Click
    Given I am on the practice greeting section
    Then the practice greeting is hidden

  Scenario: [PB-004] Toggling the Theme Sets Dark Mode
    Given I am on the practice theme section
    When I toggle the practice theme
    Then the practice page theme is "dark"
```

**Isolation lesson:** tagging these `@smoke`/`@regression` as well would make them leak into those profiles, because `smoke` is `"@smoke and not @scaffold and not @demo-failure"`. To keep them separate, tag them `@practice` only, or add `and not @practice` to the other profiles.

## B7 — Config

`cucumber.js`:

```js
module.exports = {
  default: { ...common, tags: "not @scaffold and not @demo-failure and not @practice" },
  smoke: { ...common, tags: "@smoke and not @scaffold and not @demo-failure" },
  regression: { ...common, tags: "@regression and not @scaffold and not @demo-failure" },
  scaffold: { ...common, tags: "@scaffold" },
  "demo-failure": { ...common, tags: "@demo-failure" },
  practice: { ...common, tags: "@practice" },
  "dry-run": { ...common, dryRun: true }
};
```

`package.json` scripts:

```json
"practice:serve": "http-server practice -p 9339",
"test:practice": "cross-env BASE_URL=http://127.0.0.1:9339/practice-site.html BROWSER=chromium cucumber-js --profile practice"
```

## B8 — Run

```bash
# terminal 1
npm run practice:serve

# terminal 2
npm run typecheck
npm run test:practice
npm test          # confirm the main suite still excludes @practice
```

Expected: 4 practice scenarios pass; the default suite excludes practice because of the `not @practice` clause.

---

## Stretch exercises

1. **Negative path (no new layer):** add `[PB-005]` asserting that greeting an empty name shows `"Hello, stranger!"`. You only need a scenario, because the methods and steps already exist.
2. **Multiple data sets:** add a `Scenario Outline` with `Examples:` for the greeting name. Use `{string}` steps you already have.
3. **Harden a locator:** change `practiceLocators.theme.body` from `"body"` to a role/test-id based locator by adding `data-testid="page-body"` to the fixture, and explain why an explicit contract can beat a bare tag selector.
4. **Parametrize the theme:** prove `[PB-004]` would also pass for `"light"` after two toggles; add a second scenario or a second toggle + assertion.
