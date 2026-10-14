Feature: Training site authentication forms
  As a visitor to the training site
  I want to use the login and registration forms
  So that I can verify successful and invalid form behavior

  @smoke
  Scenario: [ST-001] Successful Login with Valid Credentials
    Given I am on the "Login Form" section
    When I sign in with email "test@example.com" and password "password123"
    Then the login success confirmation is displayed

  @smoke
  Scenario: [ST-002] Complete Successful Registration
    Given I am on the "Registration Form" section
    When I complete registration with valid details
    And I submit the registration form
    Then the registration success confirmation is displayed

  @regression
  Scenario: [ST-011] Failed Login with Invalid Password
    Given I am on the "Login Form" section
    When I sign in with email "test@example.com" and password "wrongpassword"
    Then the login error is displayed and the user is not logged in

  @regression
  Scenario: [ST-012] Login with Empty Fields
    Given I am on the "Login Form" section
    When I submit the login form with empty fields
    Then the login error is displayed and the user is not logged in

  @regression
  Scenario: [ST-013] Submit Empty Registration Form
    Given I am on the "Registration Form" section
    When I submit the empty registration form
    Then required registration validation errors are displayed and the account is not created
