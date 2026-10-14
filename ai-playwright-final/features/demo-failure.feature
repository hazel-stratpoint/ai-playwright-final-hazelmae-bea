@demo-failure
Feature: Demonstrate automatic failure screenshots
  As a capstone presenter
  I want to demonstrate the failure screenshot hook
  So that the report contains real failure evidence

  Scenario: [DEMO-FAILURE] Capture a screenshot when a known hidden control is expected to be visible
    Given I am on the "Buttons & Interactions" section
    Then the hidden button is visible
