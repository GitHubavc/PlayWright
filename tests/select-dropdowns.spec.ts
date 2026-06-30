import { test, expect } from "@playwright/test";

test.describe("Dropdown select tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <div>
        <h1>Single Select Dropdown</h1>
        <select id="single-select">
          <option value="">Choose a fruit</option>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
          <option value="disabled" disabled>Disabled option</option>
        </select>

        <h1>Multi Select Dropdown</h1>
        <select id="multi-select" multiple>
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
          <option value="yellow">Yellow</option>
        </select>

        <div id="results"></div>
      </div>
      <script>
        const single = document.querySelector('#single-select');
        const multi = document.querySelector('#multi-select');
        const results = document.querySelector('#results');

        results.dataset.single = '';
        results.dataset.multi = '';

        single.addEventListener('change', () => {
          results.dataset.single = single.value;
        });

        multi.addEventListener('change', () => {
          const selected = Array.from(multi.selectedOptions).map((opt) => opt.value);
          results.dataset.multi = selected.join(',');
        });
      </script>
    `);
  });

  test("selects a valid option in a single-select dropdown", async ({ page }) => {
    await page.locator('#single-select').selectOption('banana');
    await expect(page.locator('#single-select')).toHaveValue('banana');
    expect(await page.locator('#single-select option:checked').textContent()).toBe('Banana');
    expect(await page.locator('#results').getAttribute('data-single')).toBe('banana');
  });

  test("selects the default placeholder option in single-select", async ({ page }) => {
    await page.locator('#single-select').selectOption('');
    await expect(page.locator('#single-select')).toHaveValue('');
    expect(await page.locator('#single-select option:checked').textContent()).toBe('Choose a fruit');
    expect(await page.locator('#results').getAttribute('data-single')).toBe('');
  });

  test("does not select a disabled option in single-select", async ({ page }) => {
    const disabledOption = page.locator('#single-select option[value="disabled"]');
    await expect(disabledOption).toBeDisabled();
    await expect(page.locator('#single-select')).toHaveValue('');
    expect(await page.locator('#results').getAttribute('data-single')).toBe('');
  });

  test("fails gracefully when selecting an invalid value in single-select", async ({ page }) => {
    let invalidValueError: Error | null = null;
    try {
      await page.locator('#single-select').selectOption('invalid-value');
    } catch (error) {
      invalidValueError = error as Error;
    }
    expect(invalidValueError).not.toBeNull();
    expect(invalidValueError?.message).toContain('did not find some options');
    await expect(page.locator('#single-select')).toHaveValue('');
    expect(await page.locator('#results').getAttribute('data-single')).toBe('');
  });

  test("selects multiple values in a multi-select dropdown", async ({ page }) => {
    await page.locator('#multi-select').selectOption([{ value: 'red' }, { value: 'blue' }]);
    const values = await page.locator('#multi-select').evaluate((select) => {
      const selectElement = select as HTMLSelectElement;
      return Array.from(selectElement.selectedOptions).map((opt) => opt.value);
    });
    expect(values).toEqual(['red', 'blue']);
    expect(await page.locator('#results').getAttribute('data-multi')).toBe('red,blue');
  });

  test("clears multi-select selection using an empty array", async ({ page }) => {
    await page.locator('#multi-select').selectOption([{ value: 'red' }, { value: 'green' }]);
    await page.locator('#multi-select').selectOption([]);
    const values = await page.locator('#multi-select').evaluate((select) => {
      const selectElement = select as HTMLSelectElement;
      return Array.from(selectElement.selectedOptions).map((opt) => opt.value);
    });
    expect(values).toEqual([]);
    expect(await page.locator('#results').getAttribute('data-multi')).toBe('');
  });

  test("selects all options in multi-select dropdown", async ({ page }) => {
    await page.locator('#multi-select').selectOption(['red', 'green', 'blue', 'yellow']);
    const selectedValues = await page.locator('#multi-select').evaluate((select) => {
      const selectElement = select as HTMLSelectElement;
      return Array.from(selectElement.selectedOptions).map((opt) => opt.value);
    });
    expect(selectedValues).toEqual(['red', 'green', 'blue', 'yellow']);
    expect(await page.locator('#results').getAttribute('data-multi')).toBe('red,green,blue,yellow');
  });

  test("preserves selection after clicking elsewhere", async ({ page }) => {
    await page.locator('#single-select').selectOption('cherry');
    await page.locator('body').click();
    await expect(page.locator('#single-select')).toHaveValue('cherry');
  });

  test("selects a single value in multi-select using option index", async ({ page }) => {
    await page.locator('#multi-select').selectOption({ index: 2 });
    expect(await page.locator('#multi-select')).toHaveValue('blue');
    const selectedText = await page.locator('#multi-select option:checked').textContent();
    expect(selectedText).toBe('Blue');
  });

});
