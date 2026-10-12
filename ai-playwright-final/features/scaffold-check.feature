@scaffold
Feature: Framework scaffold check
  The framework can open the configured application and verify a generic page-load outcome.

  Scenario: [SCAFFOLD] The configured application opens with a page title
    Given I open the configured application
    When the initial page load completes
    Then the page has a non-empty title
