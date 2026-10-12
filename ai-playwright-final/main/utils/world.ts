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
