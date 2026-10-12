/** Generic navigation and page-load checks for the framework scaffold scenario. */
import { expect, type Page } from "@playwright/test";
import { logger } from "main/utils/logger";

export class homePage {
  constructor(private readonly page: Page) {}

  /** Navigate to the configured application URL. */
  async navigate_to_app(): Promise<void> {
    await this.run_action("navigate_to_app", async () => {
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

  /** Wait for the initial document load state used by the scaffold check. */
  async wait_for_page_load(): Promise<void> {
    await this.run_action("wait_for_page_load", async () => {
      await this.page.waitForLoadState("domcontentloaded");
    });
  }

  /** Verify that the loaded application exposes a non-empty document title. */
  async verify_page_title(): Promise<void> {
    await this.run_action("verify_page_title", async () => {
      await expect(this.page).toHaveTitle(/.+/);
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
