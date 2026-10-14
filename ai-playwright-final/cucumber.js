// Shared Cucumber configuration; profiles change tags, not runner wiring.
const fs = require("node:fs");

for (const directory of ["reports", "allure-results"]) {
  fs.mkdirSync(directory, { recursive: true });
}

const common = {
  paths: ["features/**/*.feature"],
  requireModule: ["ts-node/register", "tsconfig-paths/register", "dotenv/config"],
  require: ["main/utils/**/*.ts", "step-definitions/**/*.ts"],
  format: [
    "progress",
    "html:reports/cucumber-report.html",
    "allure-cucumberjs/reporter"
  ],
  formatOptions: { resultsDir: "allure-results" },
  publishQuiet: true
};

module.exports = {
  default: { ...common, tags: "not @scaffold and not @demo-failure" },
  smoke: { ...common, tags: "@smoke and not @scaffold and not @demo-failure" },
  regression: { ...common, tags: "@regression and not @scaffold and not @demo-failure" },
  scaffold: { ...common, tags: "@scaffold" },
  "demo-failure": { ...common, tags: "@demo-failure" },
  "dry-run": { ...common, dryRun: true }
};
