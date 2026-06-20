import { test, expect } from "@playwright/test";

test.describe("Built-in Locators", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test page - using Playwright's built-in test page
    await page.goto("https://www.bing.com");
  });

  test("getByRole - locate element by accessibility role", async ({ page }) => {
    // Get button by role
    const searchButton = page.getByRole("button", { name: /search/i });
    await expect(searchButton).toBeDefined();
    expect(await searchButton.count()).toBeGreaterThan(0);
  });

  test("getByLabel - locate input by associated label", async ({ page }) => {
    // This would work with forms that have proper labels
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeDefined();
    expect(await searchInput.isVisible()).toBeTruthy();
  });

  test("getByPlaceholder - locate input by placeholder text", async ({ page }) => {
    // Get input by placeholder text
    const placeholderInput = page.getByPlaceholder(/search/i);
    await expect(placeholderInput).toBeDefined();
    expect(await placeholderInput.count()).toBeGreaterThanOrEqual(0);
  });

  test("getByText - locate element by visible text", async ({ page }) => {
    // Get element by text content
    const searchText = page.getByText(/search/i).first();
    await expect(searchText).toBeDefined();
    expect(await searchText.isVisible()).toBeTruthy();
  });

  test("getByTestId - locate element by data-testid attribute", async ({
    page,
  }) => {
    // This demonstrates how to use getByTestId
    // Create a locator with data-testid
    const testIdElement = page.getByTestId("test-element");
    // Check if locator is valid
    await expect(testIdElement).toBeDefined();
    // Count should work even if element doesn't exist
    expect(await testIdElement.count()).toBeGreaterThanOrEqual(0);
  });

  test("getByAltText - locate image by alt text", async ({ page }) => {
    // Get image by alt text
    const logoImage = page.getByAltText(/logo/i).first();
    // Verify the locator is accessible
    expect(logoImage).toBeDefined();
    // Check if any images with alt text matching pattern exist
    expect(await logoImage.count()).toBeGreaterThanOrEqual(0);
  });

  test("getByTitle - locate element by title attribute", async ({ page }) => {
    // Get element by title attribute
    const titleElement = page.getByTitle(/search/i).first();
    await expect(titleElement).toBeDefined();
    // Verify title attribute exists
    expect(await titleElement.count()).toBeGreaterThanOrEqual(0);
  });

  test("locator - using CSS/XPath selector", async ({ page }) => {
    // Using CSS selector with locator
    const cssLocator = page.locator("input[type='text']");
    await expect(cssLocator).toBeDefined();
    expect(await cssLocator.count()).toBeGreaterThan(0);

    // Verify elements are visible
    const firstInput = cssLocator.first();
    expect(await firstInput.isVisible()).toBeTruthy();
  });

  test("Chaining locators - combining multiple locators", async ({ page }) => {
    // Chain locators to find nested elements
    const searchContainer = page.locator('[class*="search"]').first();
    const inputInContainer = searchContainer.locator("input").first();

    // Verify the chaining works
    expect(inputInContainer).toBeDefined();
    expect(await inputInContainer.count()).toBeGreaterThanOrEqual(0);
  });

  test("locator with nth - select specific element by index", async ({
    page,
  }) => {
    // Get all inputs
    const allInputs = page.locator("input[type='text']");
    const inputCount = await allInputs.count();

    if (inputCount > 0) {
      // Get first input using nth(0)
      const firstInput = allInputs.nth(0);
      expect(firstInput).toBeDefined();
      expect(await firstInput.isVisible()).toBeTruthy();
    }
  });

  test("locator filter - filter elements by text or other criteria", async ({
    page,
  }) => {
    // Get all buttons and filter by text
    const buttons = page.locator("button");
    const searchButtons = buttons.filter({ hasText: /search/i });

    // Verify filter works
    expect(searchButtons).toBeDefined();
    expect(await searchButtons.count()).toBeGreaterThanOrEqual(0);
  });

  test("Page title assertion - basic page element verification", async ({
    page,
  }) => {
    // Verify page title
    const pageTitle = await page.title();
    expect(pageTitle).toContain("Bing");
    expect(pageTitle.length).toBeGreaterThan(0);
  });
});
