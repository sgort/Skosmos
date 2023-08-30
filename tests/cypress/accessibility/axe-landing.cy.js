import { accessibilityTestRunner } from '../support/accessibility.js'
import 'cypress-axe';

/* If you want the test to be skipped, add a skip command after the describe part:
    - test enabled: describe('Check accessibility of ...
    - test to be skipped: describe.skip('Check accessibility of ... */
describe.skip('Check accessibility of the landing page', () => {
  before(() => {
    cy.visit('/')
    cy.injectAxe()
  })

  accessibilityTestRunner()
})
