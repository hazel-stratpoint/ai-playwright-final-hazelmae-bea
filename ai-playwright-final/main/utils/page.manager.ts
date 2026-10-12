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
