/** Thin Cucumber bindings for the training-site feature scenarios. */
import { Given, Then, When } from "@cucumber/cucumber";
import type { TestWorld } from "main/utils/world";

Given("I am on the {string} section", async function (this: TestWorld, section: string) {
  await this.pages.training_site.navigate_to_section(section);
});

When(
  "I sign in with email {string} and password {string}",
  async function (this: TestWorld, email: string, password: string) {
    await this.pages.training_site.sign_in(email, password);
  }
);

When("I submit the login form with empty fields", async function (this: TestWorld) {
  await this.pages.training_site.submit_empty_login();
});

Then("the login success confirmation is displayed", async function (this: TestWorld) {
  await this.pages.training_site.verify_login_success();
});

Then("the login error is displayed and the user is not logged in", async function (this: TestWorld) {
  await this.pages.training_site.verify_login_error();
});

When("I complete registration with valid details", async function (this: TestWorld) {
  await this.pages.training_site.fill_valid_registration();
});

When("I submit the registration form", async function (this: TestWorld) {
  await this.pages.training_site.submit_registration();
});

Then("the registration success confirmation is displayed", async function (this: TestWorld) {
  await this.pages.training_site.verify_registration_success();
});

When("I submit the empty registration form", async function (this: TestWorld) {
  await this.pages.training_site.submit_registration();
});

Then(
  "required registration validation errors are displayed and the account is not created",
  async function (this: TestWorld) {
    await this.pages.training_site.verify_registration_errors();
  }
);

When(
  "I increment the counter {int} times",
  async function (this: TestWorld, times: number) {
    await this.pages.training_site.increment_counter(times);
  }
);

Then(
  "the counter displays {string}",
  async function (this: TestWorld, value: string) {
    await this.pages.training_site.verify_counter_value(value);
  }
);

When("I reset the counter", async function (this: TestWorld) {
  await this.pages.training_site.reset_counter();
});

When("I toggle the hidden button", async function (this: TestWorld) {
  await this.pages.training_site.toggle_hidden_button();
});

Then("the hidden button is visible", async function (this: TestWorld) {
  await this.pages.training_site.verify_hidden_button_visibility(true);
});

Then("the hidden button is hidden", async function (this: TestWorld) {
  await this.pages.training_site.verify_hidden_button_visibility(false);
});

When("I select the {string} tab", async function (this: TestWorld, tab: string) {
  await this.pages.training_site.select_tab(tab);
});

Then("the {string} tab panel is visible", async function (this: TestWorld, tab: string) {
  await this.pages.training_site.verify_tab_panel(tab);
});

Then("the table initially shows 8 users", async function (this: TestWorld) {
  await this.pages.training_site.verify_initial_table();
});

When("I filter the table by {string}", async function (this: TestWorld, value: string) {
  await this.pages.training_site.filter_table(value);
});

Then(
  "only 1 row containing {string} is shown",
  async function (this: TestWorld, name: string) {
    await this.pages.training_site.verify_single_table_row(name);
  }
);

Then("the table shows no matching rows", async function (this: TestWorld) {
  await this.pages.training_site.verify_no_table_rows();
});

Then("all four alert banners are visible", async function (this: TestWorld) {
  await this.pages.training_site.verify_alert_visibility(true);
});

Then("all four alert banners are hidden", async function (this: TestWorld) {
  await this.pages.training_site.verify_alert_visibility(false);
});

When("I dismiss all alert banners", async function (this: TestWorld) {
  await this.pages.training_site.dismiss_alerts();
});

When("I restore all alert banners", async function (this: TestWorld) {
  await this.pages.training_site.restore_alerts();
});

When("I open the confirmation modal", async function (this: TestWorld) {
  await this.pages.training_site.open_confirmation_modal();
});

Then("the confirmation modal is visible", async function (this: TestWorld) {
  await this.pages.training_site.verify_modal_visibility(true);
});

When("I confirm the modal", async function (this: TestWorld) {
  await this.pages.training_site.confirm_modal();
});

Then("the confirmation modal is hidden", async function (this: TestWorld) {
  await this.pages.training_site.verify_modal_visibility(false);
});

When("I request the delayed content", async function (this: TestWorld) {
  await this.pages.training_site.request_delayed_content();
});

Then("the loaded content appears within 3 seconds", async function (this: TestWorld) {
  await this.pages.training_site.verify_delayed_content();
});

When(
  "I move the {string} card from TO DO to IN PROGRESS",
  async function (this: TestWorld, cardName: string) {
    if (cardName !== "Write login test") {
      throw new Error(`Unsupported training-site card: "${cardName}".`);
    }
    await this.pages.training_site.move_login_task_to_progress();
  }
);

Then("the card is in IN PROGRESS", async function (this: TestWorld) {
  await this.pages.training_site.verify_login_task_in_progress();
});

Then("the card is no longer in TO DO", async function (this: TestWorld) {
  await this.pages.training_site.verify_login_task_not_in_todo();
});

When(
  "I type {string} into the iframe input",
  async function (this: TestWorld, text: string) {
    await this.pages.training_site.type_into_iframe(text);
  }
);

Then(
  "the iframe input contains {string}",
  async function (this: TestWorld, text: string) {
    await this.pages.training_site.verify_iframe_text(text);
  }
);
