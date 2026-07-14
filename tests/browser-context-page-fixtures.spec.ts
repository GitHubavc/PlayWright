import { test, expect } from '@playwright/test';

test.describe('Browser context and page fixtures', () => {
  test('page fixture gives each test a fresh browser page', async ({ page }) => {
    // The page fixture is created automatically for every test.
    // It gives you one isolated tab to interact with, so the DOM starts clean.
    await page.setContent('<h1>Page fixture demo</h1>');

    await expect(page.locator('h1')).toHaveText('Page fixture demo');
  });

  test('context fixture lets multiple pages share session state', async ({ context }) => {
    // The context fixture represents a browser context, which is similar to an isolated browser profile.
    // Pages created inside the same context can share cookies and other session-level state.
    await context.addCookies([
      {
        name: 'demoCookie',
        value: 'shared-value',
        domain: 'example.com',
        path: '/',
      },
    ]);

    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('https://example.com');
    await page2.goto('https://example.com');

    const cookieValuePage1 = await page1.evaluate(() => document.cookie);
    const cookieValuePage2 = await page2.evaluate(() => document.cookie);

    expect(cookieValuePage1).toContain('demoCookie=shared-value');
    expect(cookieValuePage2).toContain('demoCookie=shared-value');
  });

  test('page fixture stays isolated from other tests', async ({ page }) => {
    // A new page fixture is created for this test, so it does not inherit DOM or storage state from a previous test.
    await page.setContent('<p>Fresh page for every test</p>');

    await expect(page.locator('p')).toHaveText('Fresh page for every test');
  });
});
