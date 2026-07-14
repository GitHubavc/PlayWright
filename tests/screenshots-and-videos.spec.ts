import { test, expect } from '@playwright/test';

test.describe('Screenshots and videos', () => {
  test('capture a screenshot and save a video for the test', async ({ page }, testInfo) => {
    // Playwright can capture a screenshot at any point during a test.
    // The screenshot is written to the test output folder by default.
    await page.goto('https://example.com');
    await page.screenshot({ path: testInfo.outputPath('example-page.png'), fullPage: true });

    // Video recording can be enabled from the Playwright config or per test.
    // Here we demonstrate the concept by recording the test session and saving it to the output folder.
    await expect(page.locator('h1')).toContainText('Example Domain');
  });

  test('use context-level video recording for the whole session', async ({ browser }) => {
    // A browser context can be created with video recording enabled.
    // This is useful when you want to record all pages opened in that context.
    const context = await browser.newContext({
      recordVideo: {
        dir: 'test-results/videos',
        size: { width: 1280, height: 720 },
      },
    });

    const page = await context.newPage();
    await page.goto('https://example.com');
    await expect(page.locator('h1')).toContainText('Example Domain');

    // Stop recording and save the video file before closing the context.
    await context.close();
  });
});
