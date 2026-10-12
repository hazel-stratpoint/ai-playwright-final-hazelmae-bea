/** Verified selectors for the training site's interactive sections. */
export const trainingSiteLocators = {
  sections: {
    "Login Form": "#section-login",
    "Registration Form": "#section-register",
    "Buttons & Interactions": "#section-buttons",
    Tabs: "#section-tabs",
    "Sortable Data Table": "#section-table",
    "Alert Banners": "#section-alerts",
    "Modal Dialog": "#section-modal",
    "Delayed & Dynamic Content": "#section-dynamic",
    "Drag & Drop": "#section-dragdrop",
    "Inline Frame": "#section-iframe"
  },
  login: {
    email: "#login-email",
    password: "#login-password",
    submit: "#login-submit",
    message: "#login-message"
  },
  registration: {
    firstName: "#reg-firstname",
    lastName: "#reg-lastname",
    email: "#reg-email",
    country: "#reg-country",
    role: "#reg-role",
    webInterest: '[data-testid="interest-web"]',
    beginnerExperience: 'input[name="experience"][value="beginner"]',
    bio: "#reg-bio",
    terms: "#reg-terms",
    submit: "#reg-submit",
    message: "#reg-message"
  },
  counter: {
    value: "#counter-value",
    increment: "#counter-inc",
    reset: "#counter-reset"
  },
  hiddenButton: {
    toggle: "#btn-toggle-hidden",
    target: "#btn-hidden"
  },
  tabs: {
    Overview: { tab: '[data-testid="tab-overview"]', panel: "#panel-overview" },
    Features: { tab: '[data-testid="tab-features"]', panel: "#panel-features" },
    Pricing: { tab: '[data-testid="tab-pricing"]', panel: "#panel-pricing" }
  },
  table: {
    search: "#table-search",
    rows: "#table-body tr",
    count: "#table-count"
  },
  alerts: {
    container: "#alerts-container",
    banners: "#alerts-container .alert",
    dismiss: "#dismiss-alerts",
    restore: "#restore-alerts"
  },
  modal: {
    open: "#open-modal",
    overlay: "#modal-overlay",
    confirm: "#modal-confirm"
  },
  delayedContent: {
    load: "#load-content",
    loaded: '[data-testid="lazy-loaded"]'
  },
  dragAndDrop: {
    task: '[data-testid="task-1"]',
    todo: "#drag-todo",
    inProgress: "#drag-progress"
  },
  iframe: {
    frame: "#test-iframe",
    input: "#iframe-input"
  }
} as const;

export type TrainingSection = keyof typeof trainingSiteLocators.sections;
export type TrainingTab = keyof typeof trainingSiteLocators.tabs;
