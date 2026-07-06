import { test, expect } from '@playwright/test';

test.describe('Alerts and popups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1.title')).toContainText('Automation Testing Practice');
  });

  test('handles a simple alert popup', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('I am an alert box!');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Simple Alert' }).click();
    await expect(page.getByRole('button', { name: 'Simple Alert' })).toBeVisible();
  });

  test('handles a confirmation alert and accepts it', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Press a button!');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Confirmation Alert' }).click();
    await expect(page.locator('body')).toContainText('You pressed OK!');
  });

  test('handles a prompt alert and enters a value', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      expect(dialog.message()).toContain('Please enter your name');
      await dialog.accept('John Doe');
    });

    await page.getByRole('button', { name: 'Prompt Alert' }).click();
    await expect(page.locator('body')).toContainText('Hello John Doe! How are you today?');
  });
});
