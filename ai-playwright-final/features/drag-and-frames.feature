Feature: Training site drag and embedded frame interactions
  As a visitor to the training site
  I want to move a task card and enter text in an embedded frame
  So that I can verify advanced browser interactions

  @smoke
  Scenario: [ST-010] Drag Card from TO DO to IN PROGRESS
    Given I am on the "Drag & Drop" section
    When I move the "Write login test" card from TO DO to IN PROGRESS
    Then the card is in IN PROGRESS
    And the card is no longer in TO DO

  @regression
  Scenario: [ST-015] Type Text Inside Iframe
    Given I am on the "Inline Frame" section
    When I type "Hello from Playwright" into the iframe input
    Then the iframe input contains "Hello from Playwright"
