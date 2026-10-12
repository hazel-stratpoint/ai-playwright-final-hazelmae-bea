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
