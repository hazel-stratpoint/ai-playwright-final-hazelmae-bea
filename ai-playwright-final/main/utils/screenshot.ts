/** Saves a scenario failure screenshot before its browser context is closed. */
import fs from "node:fs/promises";
import path from "node:path";
import type { Page } from "@playwright/test";

export async function save_failure_screenshot(
  page: Page,
  scenarioName: string
): Promise<{ path: string; buffer: Buffer }> {
  const directory = path.resolve(process.cwd(), "test-results", "screenshots");
  await fs.mkdir(directory, { recursive: true });
  const safeName = scenarioName.replace(/[^\w-]+/g, "_").slice(0, 100) || "scenario";
  const filepath = path.join(directory, `${safeName}-${Date.now()}.png`);
  const buffer = await page.screenshot({ path: filepath, fullPage: true });
  return { path: filepath, buffer };
}
