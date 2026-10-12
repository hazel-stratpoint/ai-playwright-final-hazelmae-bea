/** Cucumber browser lifecycle, scenario logging, and failure screenshot hooks. */
import { After, AfterAll, Before, BeforeAll, Status } from "@cucumber/cucumber";
import { chromium, type Browser } from "@playwright/test";
import { logger } from "main/utils/logger";
import { save_failure_screenshot } from "main/utils/screenshot";
import type { TestWorld } from "main/utils/world";

let browser: Browser | undefined;

BeforeAll(async function () {
  const rawBaseUrl = process.env.BASE_URL;
  if (!rawBaseUrl) {
    throw new Error("BASE_URL is required; copy .env.example to .env and configure it.");
  }

  try {
    const url = new URL(rawBaseUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("unsupported protocol");
    }
  } catch (error) {
    throw new Error(`BASE_URL must be a valid absolute http(s) URL: ${String(error)}`);
  }

  browser = await chromium.launch({ headless: process.env.HEADED !== "true" });
});

Before(async function (this: TestWorld, { pickle }) {
  if (!browser) {
    throw new Error("Browser was not initialized by the BeforeAll hook.");
  }
  logger.info("Scenario started", { scenario: pickle.name });
  await this.start(browser);
});

After(async function (this: TestWorld, { pickle, result }) {
  try {
    if (result?.status === Status.FAILED && this.page && !this.page.isClosed()) {
      try {
        const screenshot = await save_failure_screenshot(this.page, pickle.name);
        await this.attach(screenshot.buffer, "image/png");
        logger.info("Failure screenshot captured", {
          scenario: pickle.name,
          path: screenshot.path
        });
      } catch (error) {
        logger.error("Failure screenshot capture failed", {
          scenario: pickle.name,
          error: error instanceof Error ? error.stack ?? error.message : String(error)
        });
      }
    }
  } finally {
    logger.info("Scenario finished", {
      scenario: pickle.name,
      status: result?.status ?? "unknown"
    });
    await this.dispose();
  }
});

AfterAll(async function () {
  await browser?.close();
  browser = undefined;
});
