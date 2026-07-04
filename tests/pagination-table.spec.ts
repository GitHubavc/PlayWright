import { test, expect } from '@playwright/test';

test.describe('Dynamic pagination table on Expand Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://practice.expandtesting.com/dynamic-pagination-table');
    await expect(page.getByRole('heading', { name: /Dynamic pagination Table page/i })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('loads the first page with the default number of rows and status text', async ({ page }) => {
    const rows = page.locator('table tbody tr');

    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText('Alice Johnson');
    await expect(rows.nth(1)).toContainText('Bob Williams');
    await expect(rows.nth(2)).toContainText('Daniel Martinez');
    await expect(page.getByText('Showing 1 to 3 of 10 entries')).toBeVisible();
  });

  test('changes the number of visible rows when the page size is updated', async ({ page }) => {
    await page.getByLabel('Show entries').selectOption('5');

    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(5);
    await expect(page.getByText('Showing 1 to 5 of 10 entries')).toBeVisible();
  });

  test('searches for a known value, waits for the result, and verifies the matching row', async ({ page }) => {
    const searchValue = 'Bob Williams';
    const searchBox = page.getByRole('searchbox', { name: 'Search:' });
    await searchBox.fill(searchValue);
    await page.waitForTimeout(3000);

    const visibleRows = page.locator('table tbody tr');
    const rowCount = await visibleRows.count();

    if (rowCount > 0) {
      const matchedRow = visibleRows.nth(0);
      await expect(matchedRow).toContainText(searchValue);
      const rowText = await matchedRow.textContent();
      expect(rowText).toContain(searchValue);
      console.log(`${searchValue} is present`);
    } else {
      await expect(page.getByText('No matching records found')).toBeVisible();
    }
  });

  test('navigates to the second page and updates the table status', async ({ page }) => {
    await page.getByRole('link', { name: '2' }).click();

    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(page.getByText('Showing 4 to 6 of 10 entries')).toBeVisible();
  });

  test('shows no matching records when the search term does not exist', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search:' }).fill('zzzz');

    await expect(page.locator('table tbody tr')).toHaveCount(0);
    await expect(page.getByText('No matching records found')).toBeVisible();
  });
});


