import type { Page } from "@playwright/test";

export const createTrainingSiteLocators = (page: Page) => {
  const iframe = page.getByTestId("test-iframe").contentFrame();

  return {
    sections: {
      "Login Form": page.getByRole("heading", { name: "Login Form", exact: true }),
      "Registration Form": page.getByRole("heading", { name: "Registration Form", exact: true }),
      "Buttons & Interactions": page.getByRole("heading", { name: "Buttons & Interactions", exact: true }),
      Tabs: page.getByRole("heading", { name: "Tabs", exact: true }),
      "Sortable Data Table": page.getByRole("heading", { name: "Sortable Data Table", exact: true }),
      "Alert Banners": page.getByRole("heading", { name: "Alert Banners", exact: true }),
      "Modal Dialog": page.getByRole("heading", { name: "Modal Dialog", exact: true }),
      "Delayed & Dynamic Content": page.getByRole("heading", { name: "Delayed & Dynamic Content", exact: true }),
      "Drag & Drop": page.getByRole("heading", { name: "Drag & Drop", exact: true }),
      "Inline Frame": page.getByRole("heading", { name: "Inline Frame", exact: true })
    },
    login: {
      email: page.getByPlaceholder("test@example.com", { exact: true }),
      password: page.getByLabel("Password", { exact: true }),
      submit: page.getByRole("button", { name: "Sign In", exact: true }),
      message: page.getByTestId("login-message")
    },
    registration: {
      firstName: page.getByLabel("First Name", { exact: true }),
      lastName: page.getByLabel("Last Name", { exact: true }),
      email: page.getByPlaceholder("jane@company.com", { exact: true }),
      country: page.getByRole("combobox", { name: "Country", exact: true }),
      role: page.getByRole("combobox", { name: "Role", exact: true }),
      webInterest: page.getByRole("checkbox", { name: "Web Testing", exact: true }),
      beginnerExperience: page.getByRole("radio", { name: "Beginner", exact: true }),
      bio: page.getByLabel("Bio", { exact: true }),
      terms: page.getByRole("checkbox", { name: "I agree to the Terms of Service", exact: true }),
      submit: page.getByRole("button", { name: "Create Account", exact: true }),
      message: page.getByTestId("reg-message")
    },
    counter: {
      value: page.getByTestId("counter-value"),
      increment: page.getByRole("button", { name: "+", exact: true }),
      reset: page.getByTestId("counter-reset")
    },
    hiddenButton: {
      toggle: page.getByRole("button", { name: "Toggle Hidden Button", exact: true }),
      target: page.getByTestId("btn-hidden")
    },
    tabs: {
      Overview: {
        tab: page.getByRole("tab", { name: "Overview", exact: true }),
        panel: page.getByTestId("panel-overview")
      },
      Features: {
        tab: page.getByRole("tab", { name: "Features", exact: true }),
        panel: page.getByTestId("panel-features")
      },
      Pricing: {
        tab: page.getByRole("tab", { name: "Pricing", exact: true }),
        panel: page.getByTestId("panel-pricing")
      }
    },
    table: {
      search: page.getByRole("searchbox", { name: "Filter rows...", exact: true }),
      rows: page.getByTestId("table-body").getByRole("row"),
      count: page.getByTestId("table-count")
    },
    alerts: {
      banners: page.getByTestId("alerts-container").locator(".alert"),
      dismiss: page.getByRole("button", { name: "Dismiss All", exact: true }),
      restore: page.getByRole("button", { name: "Restore All", exact: true })
    },
    modal: {
      open: page.getByRole("button", { name: "Open Confirmation Modal", exact: true }),
      overlay: page.getByTestId("modal-overlay"),
      confirm: page.getByRole("button", { name: "Confirm", exact: true })
    },
    delayedContent: {
      load: page.getByRole("button", { name: "Load Content", exact: true }),
      loaded: page.getByTestId("lazy-loaded")
    },
    dragAndDrop: {
      task: page.getByTestId("task-1"),
      todo: page.getByTestId("drag-todo"),
      inProgress: page.getByTestId("drag-progress")
    },
    iframe: {
      input: iframe.getByPlaceholder("Type here...", { exact: true })
    }
  } as const;
};

export type TrainingSection = keyof ReturnType<typeof createTrainingSiteLocators>["sections"];
export type TrainingTab = keyof ReturnType<typeof createTrainingSiteLocators>["tabs"];
