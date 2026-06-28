import { test, expect } from "@playwright/test";

test.describe("CSS locators", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <main id="main-content">
        <h1 id="main-heading" class="page-title">CSS Locator Demo</h1>
        <p class="intro">This page demonstrates CSS selectors.</p>
        <section class="card featured">
          <h2>Featured card</h2>
          <p>First paragraph inside the card.</p>
          <button class="primary-btn">Submit</button>
        </section>
        <section class="card">
          <h2>Secondary card</h2>
          <p>Second paragraph inside the card.</p>
          <button class="secondary-btn">Cancel</button>
        </section>
        <form>
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required />
          <label for="password">Password</label>
          <input id="password" name="password" type="password" />
          <input type="submit" value="Login" />
        </form>
        <ul class="menu">
          <li>Home</li>
          <li class="active">About</li>
          <li>Contact</li>
        </ul>
      </main>
    `);
  });

  test("finds an element by tag name", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("CSS Locator Demo");
  });

  test("finds an element by id", async ({ page }) => {
    const main = page.locator("#main-content");
    await expect(main).toBeVisible();
  });

  test("finds an element by class", async ({ page }) => {
    const intro = page.locator(".intro");
    await expect(intro).toBeVisible();
    await expect(intro).toHaveText("This page demonstrates CSS selectors.");
  });

  test("finds an element by attribute", async ({ page }) => {
    const emailInput = page.locator("input[type='email']");
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("name", "email");
  });

  test("finds an element by compound attribute selector", async ({ page }) => {
    const requiredInput = page.locator("input[type='email'][required]");
    await expect(requiredInput).toBeVisible();
  });

  test("finds a descendant element using CSS descendant combinator", async ({ page }) => {
    const button = page.locator(".card button").first();
    await expect(button).toBeVisible();
    await expect(button).toHaveText("Submit");
  });

  test("finds a child element using CSS child combinator", async ({ page }) => {
    const cardTitle = page.locator("section > h2");
    await expect(cardTitle.first()).toBeVisible();
    await expect(cardTitle.first()).toHaveText("Featured card");
  });

  test("finds an element by multiple classes", async ({ page }) => {
    const featuredCard = page.locator(".card.featured");
    await expect(featuredCard).toBeVisible();
    await expect(featuredCard).toContainText("Featured card");
  });

  test("finds an element using nth-child", async ({ page }) => {
    const secondMenuItem = page.locator(".menu li:nth-child(2)");
    await expect(secondMenuItem).toHaveText("About");
  });

  test("finds a button using a class selector", async ({ page }) => {
    const submitButton = page.locator(".primary-btn");
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText("Submit");
  });
});
