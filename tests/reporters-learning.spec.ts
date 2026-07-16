import { test, expect } from '@playwright/test';

/*
  Reporter learning example for Playwright.

  Run these commands from the project root to see different outputs:
  - HTML reporter: npx playwright test tests/reporters-learning.spec.ts --reporter=html
  - JSON reporter: npx playwright test tests/reporters-learning.spec.ts --reporter=json
  - JUnit reporter: npx playwright test tests/reporters-learning.spec.ts --reporter=junit
  - Allure reporter: install allure-playwright and run the suite with the Allure reporter

  Tip:
  You can also configure multiple reporters in playwright.config.ts, for example:
  reporter: [['html', { open: 'never' }], ['json', { outputFile: 'reports/results.json' }], ['junit', { outputFile: 'reports/junit.xml' }]]
*/

test.describe('Reporter learning examples', () => {
  test('renders a page that can be reported in multiple formats', async ({ page }) => {
    await page.setContent(`
      <main>
        <h1>Playwright reporters</h1>
        <p>This test is useful for learning HTML, JSON, JUnit, and Allure outputs.</p>
      </main>
    `);

    await expect(page.locator('h1')).toHaveText('Playwright reporters');
    await expect(page.locator('p')).toContainText('HTML, JSON, JUnit, and Allure');
  });
});
