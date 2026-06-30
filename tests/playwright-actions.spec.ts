import { test, expect } from "@playwright/test";

test.describe("Playwright supported actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <div id="actions-page">
        <button id="click-btn">Click me</button>
        <button id="double-btn" data-count="0">Double click me</button>
        <input id="text-input" placeholder="Type here" />
        <input id="email-input" type="email" placeholder="Email" />
        <input id="agree-checkbox" type="checkbox" />
        <label for="agree-checkbox">Agree</label>
        <select id="fruit-select">
          <option value="">Choose fruit</option>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </select>
        <input id="file-input" type="file" />
        <button id="context-btn">Right click me</button>
        <div id="hover-target">Hover me</div>
        <div id="focus-target">Focus target</div>
        <div id="drag-source" draggable="true">Drag me</div>
        <div id="drop-target">Drop here</div>

        <div id="results">
          <p id="click-result"></p>
          <p id="double-result"></p>
          <p id="input-result"></p>
          <p id="press-result"></p>
          <p id="hover-result"></p>
          <p id="checkbox-result"></p>
          <p id="select-result"></p>
          <p id="file-result"></p>
          <p id="context-result"></p>
          <p id="focus-result"></p>
          <p id="drag-result"></p>
        </div>
      </div>
      <script>
        document.querySelector("#click-btn").addEventListener("click", () => {
          document.querySelector("#click-result").textContent = "clicked";
        });
        document.querySelector("#double-btn").addEventListener("dblclick", (event) => {
          const button = event.currentTarget;
          const count = Number(button.getAttribute("data-count") || "0") + 1;
          button.setAttribute("data-count", count.toString());
          document.querySelector("#double-result").textContent = "dblclicked " + count;
        });
        document.querySelector("#text-input").addEventListener("input", (event) => {
          document.querySelector("#input-result").textContent = event.target.value;
        });
        document.querySelector("#email-input").addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            document.querySelector("#press-result").textContent = "enter pressed";
          }
        });
        document.querySelector("#hover-target").addEventListener("mouseenter", () => {
          document.querySelector("#hover-result").textContent = "hovered";
        });
        document.querySelector("#agree-checkbox").addEventListener("change", (event) => {
          document.querySelector("#checkbox-result").textContent = event.target.checked ? "checked" : "unchecked";
        });
        document.querySelector("#fruit-select").addEventListener("change", (event) => {
          document.querySelector("#select-result").textContent = event.target.value;
        });
        document.querySelector("#file-input").addEventListener("change", (event) => {
          const file = event.target.files[0];
          document.querySelector("#file-result").textContent = file ? file.name : "no file";
        });
        document.querySelector("#context-btn").addEventListener("contextmenu", (event) => {
          event.preventDefault();
          document.querySelector("#context-result").textContent = "context menu opened";
        });
        document.querySelector("#focus-target").addEventListener("focus", () => {
          document.querySelector("#focus-result").textContent = "focused";
        });
        document.querySelector("#focus-target").addEventListener("blur", () => {
          document.querySelector("#focus-result").textContent = "blurred";
        });
        const dragSource = document.querySelector("#drag-source");
        const dropTarget = document.querySelector("#drop-target");
        dropTarget.addEventListener("dragover", (event) => event.preventDefault());
        dropTarget.addEventListener("drop", (event) => {
          event.preventDefault();
          document.querySelector("#drag-result").textContent = "dropped";
        });
      </script>
    `);
  });

  test("navigates to a page using goto", async ({ page }) => {
    await page.goto("about:blank");
    expect(page.url()).toBe("about:blank");
  });

  test("clicks a button", async ({ page }) => {
    await page.locator("#click-btn").click();
    await expect(page.locator("#click-result")).toHaveText("clicked");
  });

  test("double clicks a button", async ({ page }) => {
    await page.locator("#double-btn").dblclick();
    await expect(page.locator("#double-result")).toHaveText(/dblclicked 1/);
  });

  test("fills text into an input", async ({ page }) => {
    await page.locator("#text-input").fill("Playwright");
    await expect(page.locator("#input-result")).toHaveText("Playwright");
  });

  test("types into an input and presses Enter", async ({ page }) => {
    await page.locator("#email-input").type("test@example.com");
    await page.locator("#email-input").press("Enter");
    await expect(page.locator("#press-result")).toHaveText("enter pressed");
  });

  test("hovers over an element", async ({ page }) => {
    await page.locator("#hover-target").hover();
    await expect(page.locator("#hover-result")).toHaveText("hovered");
  });

  test("checks and unchecks a checkbox", async ({ page }) => {
    const checkbox = page.locator("#agree-checkbox");
    await checkbox.check();
    await expect(page.locator("#checkbox-result")).toHaveText("checked");
    await checkbox.uncheck();
    await expect(page.locator("#checkbox-result")).toHaveText("unchecked");
  });

  test("selects an option from a dropdown", async ({ page }) => {
    await page.locator("#fruit-select").selectOption("banana");
    await expect(page.locator("#select-result")).toHaveText("banana");
  });

  test("uploads a file with setInputFiles", async ({ page }) => {
    await page.locator("#file-input").setInputFiles({
      name: "example.txt",
      mimeType: "text/plain",
      buffer: new TextEncoder().encode("hello world"),
    });
    await expect(page.locator("#file-result")).toHaveText("example.txt");
  });

  test("right clicks to open the context menu", async ({ page }) => {
    await page.locator("#context-btn").click({ button: "right" });
    await expect(page.locator("#context-result")).toHaveText("context menu opened");
  });

  test("focuses and blurs an element", async ({ page }) => {
    const focusTarget = page.locator("#focus-target");
    await focusTarget.focus();
    await expect(page.locator("#focus-result")).toHaveText("focused");
    await page.locator("#click-btn").focus();
    await expect(page.locator("#focus-result")).toHaveText("blurred");
  });

  test("drags and drops an element", async ({ page }) => {
    await page.locator("#drag-source").dragTo(page.locator("#drop-target"));
    await expect(page.locator("#drag-result")).toHaveText("dropped");
  });
});
