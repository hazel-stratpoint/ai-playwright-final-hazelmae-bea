/** Cucumber browser lifecycle, scenario logging, and failure screenshot hooks. */
import { After, AfterAll, Before, BeforeAll, Status } from "@cucumber/cucumber";
import { chromium, firefox, webkit, type Browser, type BrowserType } from "@playwright/test";
import { logger } from "main/utils/logger";
import { save_failure_screenshot } from "main/utils/screenshot";
import type { TestWorld } from "main/utils/world";

let browser: Browser | undefined;

const browserTypes = { chromium, firefox, webkit } as const;
type BrowserName = keyof typeof browserTypes;

function isBrowserName(value: string): value is BrowserName {
  return Object.hasOwn(browserTypes, value);
}

BeforeAll({ timeout: 30_000 }, async function () {
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

  const browserName = process.env.BROWSER ?? "chromium";
  if (!isBrowserName(browserName)) {
    throw new Error(
      `Unsupported BROWSER "${browserName}". Choose one of: ${Object.keys(browserTypes).join(", ")}.`
    );
  }

  const browserType: BrowserType = browserTypes[browserName];
  browser = await browserType.launch({ headless: process.env.HEADED !== "true" });
  logger.info("Browser launched", { browser: browserName });
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
