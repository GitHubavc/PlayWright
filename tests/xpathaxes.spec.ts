import { test, expect } from "@playwright/test";

test.describe("XPath axes scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <div id="container">
        <h1 id="title">XPath Axes Demo</h1>
        <p id="intro">This is the intro paragraph.</p>
        <div id="parent">
          <span id="child-one">First child</span>
          <span id="child-two">Second child</span>
          <span id="child-three">Third child</span>
        </div>
        <div id="sibling-a">Sibling A</div>
        <div id="sibling-b">Sibling B</div>
        <div id="sibling-c">Sibling C</div>
        <button id="submit">Submit</button>
      </div>
    `);
  });

  test("finds the following element using the following axis", async ({ page }) => {
    const followingElement = page.locator("//*[@id='title']/following::*[1]");
    await expect(followingElement).toHaveAttribute("id", "intro");
    await expect(followingElement).toHaveText("This is the intro paragraph.");
  });

  test("finds the preceding element using the preceding axis", async ({ page }) => {
    const precedingElement = page.locator("//*[@id='intro']/preceding::*[1]");
    await expect(precedingElement).toHaveAttribute("id", "title");
    await expect(precedingElement).toHaveText("XPath Axes Demo");
  });

  test("finds the next sibling using the following-sibling axis", async ({ page }) => {
    const nextSibling = page.locator("//*[@id='child-one']/following-sibling::*[1]");
    await expect(nextSibling).toHaveAttribute("id", "child-two");
    await expect(nextSibling).toHaveText("Second child");
  });

  test("finds the previous sibling using the preceding-sibling axis", async ({ page }) => {
    const previousSibling = page.locator("//*[@id='child-three']/preceding-sibling::*[1]");
    await expect(previousSibling).toHaveAttribute("id", "child-two");
    await expect(previousSibling).toHaveText("Second child");
  });

  test("finds parent and ancestor elements using parent and ancestor axes", async ({ page }) => {
    const parent = page.locator("//*[@id='child-two']/parent::*");
    await expect(parent).toHaveAttribute("id", "parent");

    const ancestors = page.locator("//*[@id='child-two']/ancestor::*");
    await expect(ancestors).toHaveCount(2);
    await expect(ancestors.nth(0)).toHaveAttribute("id", "parent");
    await expect(ancestors.nth(1)).toHaveAttribute("id", "container");
  });
});
