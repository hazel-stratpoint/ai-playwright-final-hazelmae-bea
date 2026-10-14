/** Lazy registry of page objects for one Cucumber scenario. */
import type { Page } from "@playwright/test";
import { homePage } from "main/functions/homePageMethods";
import { trainingSiteMethods } from "main/functions/trainingSiteMethods";

export class PageManager {
  private homePageInstance?: homePage;
  private trainingSiteInstance?: trainingSiteMethods;

  constructor(private readonly page: Page) {}

  /** Return the lazily constructed home page object. */
  get home(): homePage {
    this.homePageInstance ??= new homePage(this.page);
    return this.homePageInstance;
  }

  /** Return the lazily constructed training-site page object. */
  get training_site(): trainingSiteMethods {
    this.trainingSiteInstance ??= new trainingSiteMethods(this.page);
    return this.trainingSiteInstance;
  }
}
