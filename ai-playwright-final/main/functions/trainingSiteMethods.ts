/** Page actions and assertions for the verified training-site scenarios. */
import { expect, type Page } from "@playwright/test";
import { logger } from "main/utils/logger";
import { createTrainingSiteLocators } from "main/locators/trainingSiteLocators";

export class trainingSiteMethods {
  private readonly locators: ReturnType<typeof createTrainingSiteLocators>;

  constructor(private readonly page: Page) {
    this.locators = createTrainingSiteLocators(page);
  }

  /** Open the configured training site and scroll to a verified section. */
  async navigate_to_section(section: string): Promise<void> {
    await this.run_action("navigate_to_section", async () => {
      const sectionHeading = Object.entries(this.locators.sections)
        .find(([name]) => name === section)?.[1];
      if (!sectionHeading) {
        throw new Error(`Unsupported training-site section: "${section}".`);
      }

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
      await sectionHeading.scrollIntoViewIfNeeded();
    });
  }

  /** Sign in using the supplied email and password. */
  async sign_in(email: string, password: string): Promise<void> {
    await this.run_action("sign_in", async () => {
      await this.locators.login.email.fill(email);
      await this.locators.login.password.fill(password);
      await this.locators.login.submit.click();
    });
  }

  /** Submit the login form without entering credentials. */
  async submit_empty_login(): Promise<void> {
    await this.run_action("submit_empty_login", async () => {
      await this.locators.login.submit.click();
    });
  }

  /** Verify that the successful-login message is displayed. */
  async verify_login_success(): Promise<void> {
    await this.run_action("verify_login_success", async () => {
      await expect(this.locators.login.message)
        .toContainText("Login successful! Welcome back.");
    });
  }

  /** Verify that login is rejected with a visible invalid-credentials message. */
  async verify_login_error(): Promise<void> {
    await this.run_action("verify_login_error", async () => {
      await expect(this.locators.login.message)
        .toContainText("Invalid email or password.");
    });
  }

  /** Fill every field needed by the valid registration test case. */
  async fill_valid_registration(): Promise<void> {
    await this.run_action("fill_valid_registration", async () => {
      await this.locators.registration.firstName.fill("Jane");
      await this.locators.registration.lastName.fill("Doe");
      await this.locators.registration.email.fill("jane@company.com");
      await this.locators.registration.country.selectOption("us");
      await this.locators.registration.role.selectOption("dev");
      await this.locators.registration.webInterest.check();
      await this.locators.registration.beginnerExperience.check();
      await this.locators.registration.bio.fill("QA trainee");
      await this.locators.registration.terms.check();
    });
  }

  /** Submit the registration form. */
  async submit_registration(): Promise<void> {
    await this.run_action("submit_registration", async () => {
      await this.locators.registration.submit.click();
    });
  }

  /** Verify that the registration confirmation names the created account. */
  async verify_registration_success(): Promise<void> {
    await this.run_action("verify_registration_success", async () => {
      await expect(this.locators.registration.message)
        .toContainText("Account created for Jane Doe!");
    });
  }

  /** Verify required-field validation and confirm that registration did not succeed. */
  async verify_registration_errors(): Promise<void> {
    await this.run_action("verify_registration_errors", async () => {
      const message = this.locators.registration.message;
      await expect(message).toContainText("First name is required");
      await expect(message).toContainText("Last name is required");
      await expect(message).toContainText("Valid email is required");
      await expect(message).not.toContainText("Account created");
    });
  }

  /** Increment the counter the requested number of times. */
  async increment_counter(times: number): Promise<void> {
    await this.run_action("increment_counter", async () => {
      if (!Number.isInteger(times) || times < 1) {
        throw new Error(`Counter increment count must be a positive integer; received "${times}".`);
      }
      const incrementButton = this.locators.counter.increment;
      for (let click = 0; click < times; click += 1) {
        await incrementButton.click();
      }
    });
  }

  /** Verify the counter's displayed value. */
  async verify_counter_value(value: string): Promise<void> {
    await this.run_action("verify_counter_value", async () => {
      await expect(this.locators.counter.value).toHaveText(value);
    });
  }

  /** Reset the counter to its initial value. */
  async reset_counter(): Promise<void> {
    await this.run_action("reset_counter", async () => {
      await this.locators.counter.reset.click();
    });
  }

  /** Toggle the hidden button's visibility. */
  async toggle_hidden_button(): Promise<void> {
    await this.run_action("toggle_hidden_button", async () => {
      await this.locators.hiddenButton.toggle.click();
    });
  }

  /** Verify the hidden button's current visibility state. */
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

  /** Select a verified tab by its visible name. */
  async select_tab(tab: string): Promise<void> {
    await this.run_action("select_tab", async () => {
      const tabLocators = Object.entries(this.locators.tabs)
        .find(([name]) => name === tab)?.[1];
      if (!tabLocators) {
        throw new Error(`Unsupported training-site tab: "${tab}".`);
      }
      await tabLocators.tab.click();
    });
  }

  /** Verify that the selected tab's panel is visible. */
  async verify_tab_panel(tab: string): Promise<void> {
    await this.run_action("verify_tab_panel", async () => {
      const tabLocators = Object.entries(this.locators.tabs)
        .find(([name]) => name === tab)?.[1];
      if (!tabLocators) {
        throw new Error(`Unsupported training-site tab: "${tab}".`);
      }
      await expect(tabLocators.panel).toBeVisible();
    });
  }

  /** Verify that the unfiltered table displays its expected initial rows and count. */
  async verify_initial_table(): Promise<void> {
    await this.run_action("verify_initial_table", async () => {
      await expect(this.locators.table.rows).toHaveCount(8);
      await expect(this.locators.table.count)
        .toHaveText("Showing 8 of 8 users");
    });
  }

  /** Filter the table by the supplied text. */
  async filter_table(value: string): Promise<void> {
    await this.run_action("filter_table", async () => {
      await this.locators.table.search.fill(value);
    });
  }

  /** Verify that the table contains only the requested matching row. */
  async verify_single_table_row(name: string): Promise<void> {
    await this.run_action("verify_single_table_row", async () => {
      const rows = this.locators.table.rows;
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText(name);
    });
  }

  /** Verify that filtering produced no data rows and an empty-result count. */
  async verify_no_table_rows(): Promise<void> {
    await this.run_action("verify_no_table_rows", async () => {
      await expect(this.locators.table.rows).toHaveCount(0);
      await expect(this.locators.table.count)
        .toHaveText("Showing 0 of 8 users");
    });
  }

  /** Verify that all four alert banners have the requested visibility. */
  async verify_alert_visibility(visible: boolean): Promise<void> {
    await this.run_action("verify_alert_visibility", async () => {
      const banners = this.locators.alerts.banners;
      await expect(banners).toHaveCount(4);
      for (let index = 0; index < 4; index += 1) {
        if (visible) {
          await expect(banners.nth(index)).toBeVisible();
        } else {
          await expect(banners.nth(index)).toBeHidden();
        }
      }
    });
  }

  /** Dismiss all alert banners. */
  async dismiss_alerts(): Promise<void> {
    await this.run_action("dismiss_alerts", async () => {
      await this.locators.alerts.dismiss.click();
    });
  }

  /** Restore all alert banners. */
  async restore_alerts(): Promise<void> {
    await this.run_action("restore_alerts", async () => {
      await this.locators.alerts.restore.click();
    });
  }

  /** Open the confirmation modal. */
  async open_confirmation_modal(): Promise<void> {
    await this.run_action("open_confirmation_modal", async () => {
      await this.locators.modal.open.click();
    });
  }

  /** Confirm and close the modal. */
  async confirm_modal(): Promise<void> {
    await this.run_action("confirm_modal", async () => {
      await this.locators.modal.confirm.click();
    });
  }

  /** Verify whether the modal overlay is visible. */
  async verify_modal_visibility(visible: boolean): Promise<void> {
    await this.run_action("verify_modal_visibility", async () => {
      const overlay = this.locators.modal.overlay;
      if (visible) {
        await expect(overlay).toBeVisible();
      } else {
        await expect(overlay).toBeHidden();
      }
    });
  }

  /** Start loading the delayed content. */
  async request_delayed_content(): Promise<void> {
    await this.run_action("request_delayed_content", async () => {
      await this.locators.delayedContent.load.click();
    });
  }

  /** Verify that the delayed content becomes visible within three seconds. */
  async verify_delayed_content(): Promise<void> {
    await this.run_action("verify_delayed_content", async () => {
      await expect(this.locators.delayedContent.loaded)
        .toBeVisible({ timeout: 3000 });
    });
  }

  /** Drag the login-task card from TO DO into IN PROGRESS. */
  async move_login_task_to_progress(): Promise<void> {
    await this.run_action("move_login_task_to_progress", async () => {
      const task = this.locators.dragAndDrop.task;
      const target = this.locators.dragAndDrop.inProgress;
      const taskInTarget = target.getByTestId("task-1");

      await task.scrollIntoViewIfNeeded();
      await target.scrollIntoViewIfNeeded();

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        await task.dragTo(target, { steps: 8 });
        if (await taskInTarget.count() === 1) {
          return;
        }
        logger.warn("Drag-and-drop did not move the task; retrying", { attempt });
      }

      throw new Error("The login task did not move into the IN PROGRESS column after 3 attempts.");
    });
  }

  /** Verify that the login-task card is in IN PROGRESS. */
  async verify_login_task_in_progress(): Promise<void> {
    await this.run_action("verify_login_task_in_progress", async () => {
      await expect(this.locators.dragAndDrop.inProgress
        .getByTestId("task-1")).toBeVisible();
    });
  }

  /** Verify that the login-task card has left TO DO. */
  async verify_login_task_not_in_todo(): Promise<void> {
    await this.run_action("verify_login_task_not_in_todo", async () => {
      await expect(this.locators.dragAndDrop.todo
        .getByTestId("task-1")).toHaveCount(0);
    });
  }

  /** Click the iframe input and type the supplied text. */
  async type_into_iframe(text: string): Promise<void> {
    await this.run_action("type_into_iframe", async () => {
      const input = this.locators.iframe.input;
      await input.click();
      await input.fill(text);
    });
  }

  /** Verify the iframe input contains the supplied text. */
  async verify_iframe_text(text: string): Promise<void> {
    await this.run_action("verify_iframe_text", async () => {
      await expect(this.locators.iframe.input).toHaveValue(text);
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
