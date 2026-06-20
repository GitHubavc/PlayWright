 import { test, expect } from "@playwright/test";



test("title is Bing", async ({ page }) => {
  await page.goto("https://www.bing.com");
  const title = await page.title();
  expect(title).toContain("Bing");
});

test("title is google", async ({ page }) => {
  await page.goto("https://www.google.com");
  const title = await page.title();
  expect(title).toBe("Google");
});