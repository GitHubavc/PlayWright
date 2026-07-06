import { test, expect, type Page } from '@playwright/test';

async function selectDateByInputs(pageFixture: Page, targetYear: number, targetMonth: number, targetDate: number, isFuture: boolean) {
  const rangeSection = pageFixture.locator('label', { hasText: 'Date Picker 3:' }).locator('..');
  const startDateInput = rangeSection.locator('#start-date');
  const endDateInput = rangeSection.locator('#end-date');
  const submitButton = rangeSection.locator('button.submit-btn');

  await expect(startDateInput).toBeVisible();
  await expect(endDateInput).toBeVisible();

  const currentDate = new Date();
  const year = currentDate.getFullYear() + (isFuture ? targetYear : -targetYear);
  const month = targetMonth;
  const day = targetDate;

  const formatDate = (value: Date) => {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const startDateValue = new Date(year, month - 1, day);
  const endDateValue = new Date(startDateValue);
  endDateValue.setDate(startDateValue.getDate() + (isFuture ? 10 : -10));

  const startDate = formatDate(startDateValue);
  const endDate = formatDate(endDateValue);

  await startDateInput.fill(startDate);
  await endDateInput.fill(endDate);
  await submitButton.click();
  await pageFixture.waitForTimeout(5000);

  return { startDate, endDate, rangeSection, startDateInput, endDateInput, submitButton };
}

test.describe('Date picker scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1.title')).toContainText('Automation Testing Practice');
  });

  test('selects a valid start and end date range', async ({ page }) => {
    const { rangeSection } = await selectDateByInputs(page, 1, 12, 10, true);
    await expect(rangeSection.locator('#result')).toContainText('You selected a range of 10 days.');
  });

  test('shows an error when the end date is before the start date', async ({ page }) => {
    const { rangeSection } = await selectDateByInputs(page, 1, 12, 20, false);
    await expect(rangeSection.locator('#result')).toContainText('End date must be after start date.');
  });

  test('shows the correct validation when the start date is in the future and the end date is in the past', async ({ page }) => {
    const { rangeSection } = await selectDateByInputs(page, 5, 1, 15, true);
    await expect(rangeSection.locator('#result')).toContainText('End date must be after start date.');
  });

  test('shows a validation message when one of the dates is missing', async ({ page }) => {
    const { rangeSection, endDateInput } = await selectDateByInputs(page, 0, 12, 15, true);
    await endDateInput.fill('');
    await page.locator('button.submit-btn').click();
    await page.waitForTimeout(5000);
    await expect(rangeSection.locator('#result')).toContainText('Please select both start and end dates.');
  });
});
