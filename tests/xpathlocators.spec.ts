import { test, expect } from "@playwright/test";

test("Google homepage title", async ({ page }) => {
  await page.goto("https://www.google.com");
  const title = await page.title();
  expect(title).toContain("Google");
});

test("Search box exists using XPath", async ({ page }) => {
  await page.goto("https://www.google.com");
  const searchBox = page.locator("//textarea[@name='q']");
  await expect(searchBox).toBeVisible();
});

test("Search on Google using XPath", async ({ page }) => {
  await page.goto("https://www.google.com");
  const searchBox = page.locator("//textarea[@name='q']");
  await searchBox.fill("Playwright");
  
  // Find and click the search button
  const searchButton = page.locator("//button[@aria-label='Google Search']");
  await searchButton.click();
  
  // Wait for results page
  await page.waitForURL("**/search**");
  expect(page.url()).toContain("q=Playwright");
});

test("Google logo visible using XPath", async ({ page }) => {
  await page.goto("https://www.google.com");
  const logo = page.locator("//img[@alt='Google']");
  await expect(logo).toBeVisible();
});

test("Feel Lucky button exists using XPath", async ({ page }) => {
  await page.goto("https://www.google.com");
  const luckyButton = page.locator("//button[@aria-label=\"I'm Feeling Lucky\"]");
  await expect(luckyButton).toBeVisible();
});

test("Find input by attribute value using XPath", async ({ page }) => {
  await page.goto("https://www.google.com");
  const input = page.locator("//input[@type='text'][@name='q']");
  await expect(input).toBeVisible();
});

test("Find Google Apps menu using XPath", async ({ page }) => {
  await page.goto("https://www.google.com");
  const appsButton = page.locator("//a[@aria-label='Google apps']");
  await expect(appsButton).toBeVisible();
});

test("Search input using absolute XPath", async ({ page }) => {
  await page.goto("https://www.google.com");
  const searchInput = page.locator("//html/body//textarea[@name='q']");
  await searchInput.fill("Testing XPath");
  await expect(searchInput).toHaveValue("Testing XPath");
});

test("Find elements using XPath text matching", async ({ page }) => {
  await page.goto("https://www.google.com");
  const settingsLink = page.locator("//a[contains(text(), 'Settings')]");
  await expect(settingsLink).toBeVisible();
});

test("Find search button by multiple attributes", async ({ page }) => {
  await page.goto("https://www.google.com");
  const searchButton = page.locator("//button[@type='submit'][@name='btnK']");
  await expect(searchButton).toBeVisible();
});
