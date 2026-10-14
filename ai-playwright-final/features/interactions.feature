Feature: Training site interactions
  As a visitor to the training site
  I want to use interactive controls
  So that I can verify their visible behavior

  @smoke
  Scenario: [ST-003] Increment and Reset Counter
    Given I am on the "Buttons & Interactions" section
    When I increment the counter 5 times
    Then the counter displays "5"
    When I reset the counter
    Then the counter displays "0"

  @smoke
  Scenario: [ST-004] Toggle Hidden Button Visibility
    Given I am on the "Buttons & Interactions" section
    When I toggle the hidden button
    Then the hidden button is visible
    When I toggle the hidden button
    Then the hidden button is hidden

  @smoke
  Scenario: [ST-005] Switch Between All Tabs
    Given I am on the "Tabs" section
    When I select the "Features" tab
    Then the "Features" tab panel is visible
    When I select the "Pricing" tab
    Then the "Pricing" tab panel is visible
    When I select the "Overview" tab
    Then the "Overview" tab panel is visible

  @smoke
  Scenario: [ST-008] Open and Confirm Modal
    Given I am on the "Modal Dialog" section
    When I open the confirmation modal
    Then the confirmation modal is visible
    When I confirm the modal
    Then the confirmation modal is hidden

  @smoke
  Scenario: [ST-009] Lazy Load Content Appears After Delay
    Given I am on the "Delayed & Dynamic Content" section
    When I request the delayed content
    Then the loaded content appears within 3 seconds
