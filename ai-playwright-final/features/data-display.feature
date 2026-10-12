Feature: Training site data display
  As a visitor to the training site
  I want to filter table data and control alert banners
  So that I can verify the displayed results

  @smoke
  Scenario: [ST-006] Filter Table by Name
    Given I am on the "Sortable Data Table" section
    Then the table initially shows 8 users
    When I filter the table by "Alice"
    Then only 1 row containing "Alice Chen" is shown

  @smoke
  Scenario: [ST-007] Dismiss and Restore Alert Banners
    Given I am on the "Alert Banners" section
    Then all four alert banners are visible
    When I dismiss all alert banners
    Then all four alert banners are hidden
    When I restore all alert banners
    Then all four alert banners are visible

  @regression
  Scenario: [ST-014] Filter Returns No Results
    Given I am on the "Sortable Data Table" section
    When I filter the table by "zzznomatch"
    Then the table shows no matching rows
