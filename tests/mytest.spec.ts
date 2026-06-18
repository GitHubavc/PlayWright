 import { test, expect } from "@playwright/test";

test("title is google", async ({ page }) => {
  await page.goto("https://www.google.com");
  const title = await page.title();
  expect(title).toBe("Google");
  expect(title).not.toBe("Bing");
  expect(title).toContain("Goog");
  expect(title).not.toContain("Bing");
  expect(title).toMatch(/Google/);
  expect(title).not.toMatch(/Bing/);
  expect(title).toEqual("Google");
  expect(title).not.toEqual("Bing");

  
});