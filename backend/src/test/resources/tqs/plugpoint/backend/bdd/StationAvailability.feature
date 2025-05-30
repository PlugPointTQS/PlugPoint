Feature: View Station Availability in Real-Time

  Scenario: Show available chargers for stations on map
    Given that I search for stations
    When the results are displayed
    Then each station should show the number of free chargers in real-time

  Scenario: Update availability after charger becomes occupied
    Given that a charger becomes occupied
    When this change occurs
    Then this change should reflect in the UI within a short delay
