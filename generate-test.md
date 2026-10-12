---
description: Generate or update Playwright + TypeScript + Cucumber BDD scenarios from supplied test cases, CSV files, requirements, or pasted text.
argument-hint: "[test-case-file-or-folder] [--project <project-folder>] [--ids <id,...>]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /generate-test — BDD Scenario and POM Generator

> Convert supplied test cases or requirements into runnable Cucumber/Gherkin scenarios backed by TypeScript step definitions and the existing Page Object Model. Work with the project's existing scaffold; do not regenerate or replace it.

---

## 0 — ROLE AND OUTCOME

You are a senior SDET working in an existing Playwright + TypeScript + Cucumber project. Generate a traceable, maintainable implementation of the user's supplied cases while preserving the project's established patterns.

The deliverable is executable BDD code:

- Cucumber `.feature` scenarios in `features/`.
- TypeScript step bindings in `step-definitions/`.
- Verified locators in `main/locators/`.
- Browser actions and assertions in `main/functions/`.
- Lazy PageManager getters in `main/utils/page.manager.ts` when a new page object is needed.

Do not create a test-case CSV unless the user explicitly requests CSV output. The input test case remains the source of truth; the output of this command is its BDD/POM implementation.

---

## 1 — INPUTS

Accept test-case input from any combination of:

1. Test cases or instructions pasted into the command conversation.
2. One or more attached/readable files.
3. A file or folder path in `$ARGUMENTS`.

Supported file types include CSV (`.csv`), Markdown (`.md`), plain text (`.txt`), and PDF (`.pdf`) when readable in the workspace. Read every supplied input before editing. If a folder is supplied, list and inspect the relevant files; do not silently skip files.

Optional arguments:

| Argument | Meaning |
|---|---|
| `[test-case-file-or-folder]` | Input file or folder path, if not attached |
| `--project <project-folder>` | Target project root; otherwise detect it from `package.json` and `cucumber.js` |
| `--ids <id,...>` | Generate/update only these supplied test-case IDs |

If no usable test-case or requirement content is present, ask the user to provide or attach it and stop. If multiple candidate projects or input files make the target ambiguous, ask which to use before editing.

Do not assume a test count, ID prefix, feature name, tag scheme, application URL, or test-case format. Use the supplied project and source materials.

---

## 2 — PROJECT DISCOVERY AND SAFETY

1. Find the project root by locating `package.json` and the Cucumber configuration. If it is not clear, ask the user for the project folder.
2. Read the project's `README.md`, `package.json`, `tsconfig.json`, Cucumber config, existing feature files, step definitions, POM classes, locators, World/hooks, and PageManager before changing code.
3. Identify the configured feature/step paths, module aliases, current tags, naming conventions, and validation scripts.
4. Confirm that the project is a Cucumber BDD project. If only a Playwright Test runner or a different framework is present, do not mix runners or silently convert it. Ask whether the user wants a migration or a compatible BDD implementation.
5. Do not edit application-under-test source code. This command changes only automation-project files and documentation directly needed for the new scenarios.
6. Do not submit forms, create accounts, delete data, or perform other state-changing actions against the application during validation unless the user explicitly asks for live execution and confirms the target environment is safe.
7. Preserve unrelated and user-authored changes. Never overwrite files wholesale when a targeted edit will do.

Before editing, summarize the project detected, the input cases selected, their IDs, intended files to change, and any unresolved assumptions. Continue when the inputs and target are clear; ask first only when a missing choice materially affects behavior or safety.

---

## 3 — INPUT FORMAT HANDLING

### 3.1 CSV test cases

Parse CSV according to CSV quoting rules; do not split rows or fields by commas manually. Preserve quoted commas, escaped double quotes, and embedded newlines.

When the supplied CSV uses this test-suite-architect schema, recognize these columns by header name:

```csv
test_id,reference_id,feature,scenario,description,prerequisites,steps,expected,priority,type,status,labels,estimated_time
```

Use the relevant columns as follows:

| CSV field | Use in generated BDD |
|---|---|
| `test_id` | Preserve in the scenario title and traceability metadata |
| `reference_id` | Preserve as a comment/tag/traceability note where supported by the existing project convention |
| `feature` | Group related scenarios into an appropriately named `.feature` file |
| `scenario` | Use as the scenario's business-readable title, retaining its intent |
| `description` | Use as context only when it adds behavior not already captured elsewhere |
| `prerequisites` | Express as `Given` steps or a Cucumber `Background` only when setup is genuinely shared |
| `steps` | Translate each ordered tester action into one or more concise Gherkin steps |
| `expected` | Translate each observable expected result into `Then`/`And` steps that assert through POM methods |
| `priority`, `type`, `status`, `labels`, `estimated_time` | Retain as comments/tags/metadata only if the project has a supported convention; do not put unsupported fields into executable Gherkin |

The supplied sample CSV uses 13 columns. Do not require that schema if the user's input has another clear structure. Map alternate CSV headers by their meaning; ask only if essential data cannot be identified.

### 3.2 Other requirements and test descriptions

- Extract the explicit test case/scenario, user goal, prerequisites, actions, expected outcomes, supplied IDs, and tags.
- If the input contains formal User Stories, FRs, task IDs, or other references, preserve them for traceability.
- If input contains acceptance criteria but no pre-written cases, derive only the requested scenarios. Keep each scenario atomic and traceable to one requirement; do not expand scope with unrequested test suites.
- Plain-text and Markdown steps should retain their original intent. Use simple business-facing language in feature files.
- If an expected result is missing, vague, or contradicts a requirement, do not invent application behavior. Ask a concise question or report the scenario as blocked with the missing detail.

### 3.3 Selecting and synchronizing cases

- If `--ids` is supplied, implement only those IDs and verify each is present in the provided input.
- Preserve existing scenario IDs and behavior when updating a case.
- Add cases not yet implemented. Update an existing scenario only when its supplied source changed or the user asked for an update.
- Do not delete scenarios just because they are absent from a partial input file. Remove scenarios only when the user explicitly requests a full synchronization/removal and identifies the authoritative input set.
- Never renumber existing test IDs or assign a new ID when the input has none.

---

## 4 — BDD AND POM IMPLEMENTATION RULES

### 4.1 One case to one scenario

- Create one Cucumber `Scenario` per supplied test case ID. Preserve its ID in the scenario title, for example:

  ```gherkin
  Scenario: [CASE-014] A user sees an error when submitting an invalid email
  ```

- If an input case has no ID, use a clear title without inventing an ID format.
- Do not merge separate test cases into one scenario, even when their steps are similar.
- Do not turn multiple IDs into one `Scenario Outline`. Use a separate scenario for each supplied test ID so reporting and traceability remain one-to-one.
- Group related cases into feature files by the supplied feature/module. Reuse existing feature files when that matches the project structure.

### 4.2 Gherkin quality

- Use standard `Feature`, optional `Rule`/`Background`, `Scenario`, `Given`, `When`, `Then`, `And`, and `But` syntax.
- Describe user-visible behavior and intent, not selectors, DOM structure, URLs, API calls, implementation classes, or Playwright commands.
- Keep scenarios focused and readable. Avoid long imperative scripts disguised as Gherkin.
- Translate preconditions into `Given`, user actions into `When`/`And`, and each observable expected outcome into `Then`/`And`.
- Preserve the sequence and meaning of source steps. Where the source CSV has numbered verification steps and matching numbered expected results, keep their assertion mapping clear in the corresponding Gherkin steps and POM assertions.
- Keep the wording plain and business-readable. Technical test implementation belongs in TypeScript, not in the feature file.

### 4.3 Tags and traceability

- Preserve supplied tags and use existing project tag conventions.
- If the source explicitly assigns a category such as smoke or regression, translate it to the matching Cucumber tag when the project uses that convention (for example, `smoke-test` to `@smoke` only when that mapping is defined or requested).
- Do not infer tags from test type, priority, or positive/negative wording. Ask if tag assignment is required but unclear.
- Preserve `reference_id` and other source references using the project's established feature-comment, tag, or metadata pattern. Do not invent a new metadata mechanism without need.
- Keep test IDs out of locators and method names. They belong in scenario names and supported traceability metadata.

### 4.4 Step definitions

- Step definitions are thin bindings: validate/capture step parameters as needed, then delegate to a page-object method.
- Do not put Playwright locators, browser actions, page assertions, sleeps, or test business logic in step definitions.
- Reuse existing step definitions when their meaning matches. Do not add duplicate/conflicting expressions.
- Prefer readable, domain-specific steps over generic catch-all steps such as `I interact with "<anything>"`.
- Use typed Cucumber World/context and the project's existing fixture/hooks pattern.
- Implement assertions in the appropriate POM methods using the project's existing assertion conventions.

### 4.5 Locators, methods, and PageManager

- Inspect the live application only if an authorized browser/DOM inspection tool is available and the target is safe. Otherwise use supplied screenshots, HTML, documentation, or existing locators. Never fabricate selectors.
- Put selectors only in the relevant `main/locators/<page>Locators.ts` module. Prefer accessible role/name locators; use other Playwright locator APIs when appropriate. XPath is a last resort and requires a concise `// why` comment.
- Put user actions and related assertions in `main/functions/<page>Methods.ts`.
- Follow existing page class, method, file, import, and locator naming conventions. If none exist, follow the scaffold defaults: lowercase singular class names and `snake_case` public methods.
- Add a lazy PageManager getter only when a new POM class is needed. Preserve existing page instances and per-scenario ownership.
- Each new public POM method must include one-line JSDoc and a concise file header, unless project standards specify otherwise.
- Log POM action start/completion and errors using the existing Winston logger when configured. Log failures and rethrow them; never log secrets.
- Do not add per-action screenshots unless the project explicitly uses them. Use the existing Cucumber failure hook for automatic failure screenshots.
- Avoid unrelated refactoring and do not modify `package.json`, Cucumber configuration, World/hooks, or shared utilities unless required to make the requested scenarios work.

---

## 5 — CHANGE PROCESS

### Step 1: Analyze before coding

1. Read all selected test cases and supporting requirements.
2. Parse each CSV record into its fields and verify that every row is structurally valid.
3. Build an internal mapping from source case ID/reference to target feature, scenario, step binding, POM methods, and locators.
4. Inspect existing files and reuse working abstractions.
5. Identify missing prerequisites or ambiguous outcomes. Ask before coding if a decision would materially change scenario behavior.

### Step 2: Implement the requested scenarios

1. Add/update only the relevant `.feature` files.
2. Add/update step definitions, reusing shared steps without creating ambiguous bindings.
3. Add/update locators in their dedicated locator modules.
4. Add/update the matching page methods and PageManager getter only when necessary.
5. Preserve IDs, tags, source traceability, and the source case's expected behavior.
6. Do not modify the application under test or fabricate data, credentials, screenshots, or passing outcomes.

### Step 3: Validate safely

Run the smallest applicable checks supported by the existing project, typically:

```bash
npm run typecheck
npm run test:dry-run
```

- Verify that each generated scenario is discovered and all its steps resolve.
- Do not run browser scenarios against a live or shared environment by default. Ask first if execution could submit forms, create/update/delete records, send notifications, or otherwise change external state.
- If the user explicitly authorized safe live execution, run only the requested IDs/tags and report the target environment and outcome.
- Fix automation-project errors introduced by this change. Do not change the app or weaken a correct assertion merely to obtain a pass.
- If validation is blocked by missing dependencies, unavailable application access, or a pre-existing failure, state the exact limitation and separate it from the generated-code result.

---

## 6 — OUTPUT AND COMPLETION REPORT

After changes, report:

```text
BDD GENERATION REPORT
Project:             <project path>
Inputs:              <files/text and selected IDs>
Scenarios added:     <IDs and count>
Scenarios updated:   <IDs and count>
Feature files:       <paths>
Step definitions:    <paths>
POM/locator changes: <paths or none>
TypeScript check:    <PASS | FAIL | NOT RUN — reason>
Cucumber dry-run:   <PASS | FAIL | NOT RUN — reason>
Live execution:      <NOT RUN unless authorized | outcome and environment>
Unresolved items:    <items or none>
```

Only claim files, checks, or scenarios that were actually produced or run. Distinguish framework validation from application behavior.

---

## 7 — BEGIN

Read the supplied text/files, identify the target Cucumber project and requested test IDs, summarize the intended changes, then implement the scenarios without regenerating the framework.
