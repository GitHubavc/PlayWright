import { test, expect } from "@playwright/test";

test.describe("Autosuggestive Dropdown Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .autocomplete-container {
          width: 300px;
          margin: 20px 0;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
          background: white;
          border: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 4px 4px;
          display: none;
          z-index: 1;
        }
        .suggestions-list.active {
          display: block;
        }
        .suggestion-item {
          padding: 10px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        .suggestion-item:hover,
        .suggestion-item.highlighted {
          background-color: #f0f0f0;
        }
        .suggestion-item.active {
          background-color: #007bff;
          color: white;
        }
        .no-suggestions {
          padding: 10px;
          color: #999;
        }
        #results {
          margin-top: 20px;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 4px;
        }
      </style>

      <div id="basic-container" class="autocomplete-container">
        <label for="basic-input">Select Country</label>
        <input id="basic-input" type="text" placeholder="Type a country name..." autocomplete="off">
        <div class="suggestions-list" id="basic-suggestions"></div>
      </div>

      <div id="multi-container" class="autocomplete-container">
        <label for="multi-input">Select Multiple Countries</label>
        <input id="multi-input" type="text" placeholder="Type to add countries..." autocomplete="off">
        <div class="suggestions-list" id="multi-suggestions"></div>
        <div id="selected-items"></div>
      </div>

      <div id="results">
        <h3>Results:</h3>
        <div id="selected-text"></div>
        <div id="search-text"></div>
        <div id="error-message"></div>
      </div>

      <script>
        const countries = [
          'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Argentina', 'Austria',
          'Australia', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Belarus',
          'Belgium', 'Belize', 'Benin', 'Bermuda', 'Brazil', 'Bulgaria', 'Canada',
          'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
          'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador',
          'Egypt', 'Estonia', 'Finland', 'France', 'Germany', 'Ghana', 'Greece',
          'Greenland', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guyana', 'Haiti',
          'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
          'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan',
          'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'South Korea', 'Kuwait',
          'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
          'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'Madagascar', 'Malawi',
          'Malaysia', 'Maldives', 'Mali', 'Malta', 'Martinique', 'Mauritania',
          'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
          'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands',
          'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan',
          'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
          'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russia',
          'Rwanda', 'Saint Barthelemy', 'Saint Helena', 'Saint Kitts And Nevis',
          'Saint Lucia', 'Saint Martin', 'Saint Vincent And Grenadines', 'Samoa',
          'San Marino', 'Sao Tome And Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
          'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten', 'Slovakia',
          'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan',
          'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
          'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
          'Tonga', 'Trinidad And Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
          'Turks And Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
          'United Kingdom', 'United States', 'United States Virgin Islands', 'Uruguay',
          'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Wallis And Futuna',
          'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'
        ];

        class AutocompleteSuggestor {
          constructor(inputId, suggestionsId, resultId, isMulti = false) {
            this.input = document.getElementById(inputId);
            this.suggestionsList = document.getElementById(suggestionsId);
            this.resultDiv = resultId ? document.getElementById(resultId) : null;
            this.isMulti = isMulti;
            this.selectedItems = isMulti ? [] : null;
            this.highlightedIndex = -1;

            this.input.addEventListener('input', (e) => this.handleInput(e));
            this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
            this.input.addEventListener('focus', (e) => this.handleFocus(e));
            document.addEventListener('click', (e) => this.handleClickOutside(e));
          }

          handleInput(e) {
            const value = e.target.value.trim();
            this.highlightedIndex = -1;
            this.filterAndDisplay(value);
            this.updateResults();
          }

          handleFocus(e) {
            const value = e.target.value.trim();
            if (value) {
              this.filterAndDisplay(value);
            }
          }

          handleClickOutside(e) {
            if (!e.target.closest('.autocomplete-container')) {
              this.suggestionsList.classList.remove('active');
            }
          }

          handleKeydown(e) {
            const items = this.suggestionsList.querySelectorAll('.suggestion-item:not(.no-suggestions)');

            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                this.highlightedIndex = Math.min(this.highlightedIndex + 1, items.length - 1);
                this.updateHighlight(items);
                break;
              case 'ArrowUp':
                e.preventDefault();
                this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
                this.updateHighlight(items);
                break;
              case 'Enter':
                e.preventDefault();
                if (this.highlightedIndex >= 0 && items[this.highlightedIndex]) {
                  items[this.highlightedIndex].click();
                }
                break;
              case 'Escape':
                this.suggestionsList.classList.remove('active');
                break;
            }
          }

          updateHighlight(items) {
            items.forEach((item, index) => {
              item.classList.toggle('highlighted', index === this.highlightedIndex);
            });
          }

          filterAndDisplay(value) {
            if (!value) {
              this.suggestionsList.classList.remove('active');
              return;
            }

            const filtered = countries.filter(country =>
              country.toLowerCase().includes(value.toLowerCase())
            );

            this.displaySuggestions(filtered, value);
          }

          displaySuggestions(filtered, searchValue) {
            this.suggestionsList.innerHTML = '';

            if (filtered.length === 0) {
              this.suggestionsList.innerHTML = '<div class="no-suggestions">No matches found</div>';
              this.suggestionsList.classList.add('active');
              return;
            }

            filtered.forEach((country, index) => {
              const item = document.createElement('div');
              item.className = 'suggestion-item';
              item.textContent = country;
              item.dataset.value = country;

              if (this.isMulti && this.selectedItems.includes(country)) {
                item.classList.add('active');
              }

              item.addEventListener('click', () => this.selectItem(country));
              this.suggestionsList.appendChild(item);
            });

            this.suggestionsList.classList.add('active');
          }

          selectItem(country) {
            if (this.isMulti) {
              if (this.selectedItems.includes(country)) {
                this.selectedItems = this.selectedItems.filter(item => item !== country);
              } else {
                this.selectedItems.push(country);
              }
              this.input.value = '';
              this.displaySelectedItems();
              this.filterAndDisplay('');
            } else {
              this.input.value = country;
              this.suggestionsList.classList.remove('active');
            }
            this.updateResults();
          }

          displaySelectedItems() {
            const container = document.getElementById('selected-items');
            container.innerHTML = this.selectedItems.map(item =>
              \`<span style="display: inline-block; background: #007bff; color: white; padding: 5px 10px; margin: 5px 5px 5px 0; border-radius: 4px;">\${item}</span>\`
            ).join('');
          }

          updateResults() {
            if (this.resultDiv) {
              if (this.isMulti) {
                document.getElementById('selected-text').textContent = 'Selected: ' + this.selectedItems.join(', ');
              } else {
                document.getElementById('selected-text').textContent = 'Selected: ' + (this.input.value || 'None');
              }
              document.getElementById('search-text').textContent = 'Search Term: ' + this.input.value;
            }
          }

          getSelectedValue() {
            return this.isMulti ? this.selectedItems : this.input.value;
          }

          clearInput() {
            this.input.value = '';
            this.selectedItems = this.isMulti ? [] : null;
            this.displaySelectedItems?.();
            this.suggestionsList.classList.remove('active');
            this.updateResults();
          }
        }

        window.basicAutocomplete = new AutocompleteSuggestor('basic-input', 'basic-suggestions', 'results');
        window.multiAutocomplete = new AutocompleteSuggestor('multi-input', 'multi-suggestions', 'results', true);
      </script>
    `);
  });

  // Basic Functionality Tests
  test("displays suggestions when user starts typing", async ({ page }) => {
    await page.fill('#basic-input', 'ind');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some(s => s.includes('India'))).toBeTruthy();
  });

  test("filters suggestions based on input text", async ({ page }) => {
    await page.fill('#basic-input', 'usa');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    suggestions.forEach(suggestion => {
      expect(suggestion.toLowerCase()).toContain('usa');
    });
  });

  test("selects a country from suggestions by clicking", async ({ page }) => {
    await page.fill('#basic-input', 'france');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    await page.click('[data-value="France"]');
    await expect(page.locator('#basic-input')).toHaveValue('France');
    await expect(page.locator('#selected-text')).toContainText('Selected: France');
  });

  test("closes suggestion list when item is selected", async ({ page }) => {
    await page.fill('#basic-input', 'ger');
    await page.waitForSelector('[data-value="Germany"]', { timeout: 2000 });
    
    await page.click('[data-value="Germany"]');
    await expect(page.locator('.suggestions-list')).not.toHaveClass(/active/);
  });

  test("shows 'No matches found' when no suggestions match", async ({ page }) => {
    await page.fill('#basic-input', 'xyz123xyz');
    await page.waitForSelector('.no-suggestions', { timeout: 2000 });
    
    await expect(page.locator('.no-suggestions')).toContainText('No matches found');
  });

  // Keyboard Navigation Tests
  test("navigates suggestions with arrow keys", async ({ page }) => {
    await page.fill('#basic-input', 'a');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    await page.press('#basic-input', 'ArrowDown');
    await expect(page.locator('.suggestion-item.highlighted')).toBeTruthy();
    
    await page.press('#basic-input', 'ArrowDown');
    const highlightedItems = await page.locator('.suggestion-item.highlighted').count();
    expect(highlightedItems).toBe(1);
  });

  test("selects suggestion with Enter key", async ({ page }) => {
    await page.fill('#basic-input', 'can');
    await page.waitForSelector('[data-value="Canada"]', { timeout: 2000 });
    
    await page.press('#basic-input', 'ArrowDown');
    await page.press('#basic-input', 'Enter');
    
    await expect(page.locator('#basic-input')).toHaveValue('Canada');
  });

  test("closes suggestions with Escape key", async ({ page }) => {
    await page.fill('#basic-input', 'aust');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    await page.press('#basic-input', 'Escape');
    await expect(page.locator('.suggestions-list')).not.toHaveClass(/active/);
  });

  test("moves highlight up with arrow up key", async ({ page }) => {
    await page.fill('#basic-input', 'bra');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    await page.press('#basic-input', 'ArrowDown');
    await page.press('#basic-input', 'ArrowDown');
    await page.press('#basic-input', 'ArrowUp');
    
    const highlightedItems = await page.locator('.suggestion-item.highlighted').count();
    expect(highlightedItems).toBe(1);
  });

  test("does not go above first item when pressing arrow up", async ({ page }) => {
    await page.fill('#basic-input', 'chi');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    await page.press('#basic-input', 'ArrowUp');
    await page.press('#basic-input', 'ArrowUp');
    
    const highlightedItems = await page.locator('.suggestion-item.highlighted').count();
    expect(highlightedItems).toBe(0);
  });

  // Case Sensitivity Tests
  test("handles lowercase input matching uppercase suggestions", async ({ page }) => {
    await page.fill('#basic-input', 'france');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.some(s => s === 'France')).toBeTruthy();
  });

  test("handles uppercase input matching lowercase suggestions", async ({ page }) => {
    await page.fill('#basic-input', 'FRANCE');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.some(s => s === 'France')).toBeTruthy();
  });

  test("handles mixed case input", async ({ page }) => {
    await page.fill('#basic-input', 'FrAnCe');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.some(s => s === 'France')).toBeTruthy();
  });

  // Partial Match Tests
  test("matches partial text from beginning", async ({ page }) => {
    await page.fill('#basic-input', 'United');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.length).toBeGreaterThan(0);
    suggestions.forEach(s => expect(s).toContain('United'));
  });

  test("matches partial text from middle", async ({ page }) => {
    await page.fill('#basic-input', 'land');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test("matches partial text from end", async ({ page }) => {
    await page.fill('#basic-input', 'ia');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.some(s => s.endsWith('ia'))).toBeTruthy();
  });

  // Empty Input Tests
  test("hides suggestions when input is cleared", async ({ page }) => {
    await page.fill('#basic-input', 'france');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    await page.fill('#basic-input', '');
    await expect(page.locator('.suggestions-list')).not.toHaveClass(/active/);
  });

  test("shows no suggestions on empty input", async ({ page }) => {
    const suggestionCount = await page.locator('.suggestion-item').count();
    expect(suggestionCount).toBe(0);
  });

  test("clears input when focused with empty value", async ({ page }) => {
    await page.fill('#basic-input', 'france');
    await page.click('[data-value="France"]');
    
    await page.fill('#basic-input', '');
    await expect(page.locator('#basic-input')).toHaveValue('');
  });

  // Special Character Tests
  test("handles spaces in input", async ({ page }) => {
    await page.fill('#basic-input', 'south ');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test("handles leading and trailing spaces", async ({ page }) => {
    await page.fill('#basic-input', '  france  ');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.some(s => s === 'France')).toBeTruthy();
  });

  // Multi-Select Tests
  test("adds multiple countries in multi-select mode", async ({ page }) => {
    await page.fill('#multi-input', 'united kingdom');
    await page.waitForSelector('[data-value="United Kingdom"]', { timeout: 2000 });
    
    await page.click('[data-value="United Kingdom"]');
    await expect(page.locator('#selected-items')).toContainText('United Kingdom');
    
    await page.fill('#multi-input', 'france');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    await page.click('[data-value="France"]');
    await expect(page.locator('#selected-items')).toContainText('France');
    await expect(page.locator('#selected-items')).toContainText('United Kingdom');
  });

  test("removes selected item when clicked again in multi-select", async ({ page }) => {
    await page.fill('#multi-input', 'germany');
    await page.waitForSelector('[data-value="Germany"]', { timeout: 2000 });
    
    await page.click('[data-value="Germany"]');
    await expect(page.locator('#selected-items')).toContainText('Germany');
    
    await page.click('[data-value="Germany"]');
    await expect(page.locator('#selected-items')).not.toContainText('Germany');
  });

  test("clears input after selection in multi-select", async ({ page }) => {
    await page.fill('#multi-input', 'spain');
    await page.waitForSelector('[data-value="Spain"]', { timeout: 2000 });
    
    await page.click('[data-value="Spain"]');
    await expect(page.locator('#multi-input')).toHaveValue('');
  });

  test("maintains selected items while filtering in multi-select", async ({ page }) => {
    await page.fill('#multi-input', 'italy');
    await page.waitForSelector('[data-value="Italy"]', { timeout: 2000 });
    
    await page.click('[data-value="Italy"]');
    
    await page.fill('#multi-input', 'can');
    await page.waitForSelector('[data-value="Canada"]', { timeout: 2000 });
    
    await page.click('[data-value="Canada"]');
    
    const selectedText = await page.locator('#selected-items').textContent();
    expect(selectedText).toContain('Italy');
    expect(selectedText).toContain('Canada');
  });

  // Results Display Tests
  test("updates selected text in results", async ({ page }) => {
    await page.fill('#basic-input', 'japan');
    await page.waitForSelector('[data-value="Japan"]', { timeout: 2000 });
    
    await page.click('[data-value="Japan"]');
    await expect(page.locator('#selected-text')).toContainText('Selected: Japan');
  });

  test("updates search term in results", async ({ page }) => {
    await page.fill('#basic-input', 'ind');
    await expect(page.locator('#search-text')).toContainText('Search Term: ind');
  });

  test("displays full country name in results after selection", async ({ page }) => {
    await page.fill('#basic-input', 'aus');
    await page.waitForSelector('[data-value="Australia"]', { timeout: 2000 });
    
    await page.click('[data-value="Australia"]');
    const selectedText = await page.locator('#selected-text').textContent();
    expect(selectedText).toContain('Australia');
  });

  // Focus and Blur Tests
  test("displays suggestions when input is focused with text", async ({ page }) => {
    await page.fill('#basic-input', 'france');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    await expect(page.locator('.suggestions-list')).toHaveClass(/active/);
  });

  test("closes suggestions when clicking outside", async ({ page }) => {
    await page.fill('#basic-input', 'france');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    await page.click('#results');
    await expect(page.locator('.suggestions-list')).not.toHaveClass(/active/);
  });

  // Performance Tests
  test("handles large number of suggestions efficiently", async ({ page }) => {
    const startTime = Date.now();
    
    await page.fill('#basic-input', 'a');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(5000);
    
    const suggestionCount = await page.locator('.suggestion-item').count();
    expect(suggestionCount).toBeGreaterThan(0);
  });

  // Suggestion Count Tests
  test("limits suggestions appropriately", async ({ page }) => {
    await page.fill('#basic-input', 'u');
    await page.waitForSelector('.suggestion-item', { timeout: 2000 });
    
    const suggestionCount = await page.locator('.suggestion-item').count();
    expect(suggestionCount).toBeLessThan(300);
    expect(suggestionCount).toBeGreaterThan(0);
  });

  test("returns fewer suggestions for more specific input", async ({ page }) => {
    await page.fill('#basic-input', 'a');
    const countForA = await page.locator('.suggestion-item').count();
    
    await page.fill('#basic-input', 'azer');
    const countForAzer = await page.locator('.suggestion-item').count();
    
    expect(countForAzer).toBeLessThanOrEqual(countForA);
  });

  // Exact Match Tests
  test("finds exact match in suggestions", async ({ page }) => {
    await page.fill('#basic-input', 'France');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions).toContain('France');
  });

  test("can select exact match", async ({ page }) => {
    await page.fill('#basic-input', 'France');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    await page.click('[data-value="France"]');
    await expect(page.locator('#basic-input')).toHaveValue('France');
  });

  // Reset/Clear Tests
  test("allows reuse after selecting item", async ({ page }) => {
    await page.fill('#basic-input', 'france');
    await page.waitForSelector('[data-value="France"]', { timeout: 2000 });
    
    await page.click('[data-value="France"]');
    
    await page.fill('#basic-input', 'germany');
    await page.waitForSelector('[data-value="Germany"]', { timeout: 2000 });
    
    const suggestions = await page.locator('.suggestion-item').allTextContents();
    expect(suggestions.some(s => s === 'Germany')).toBeTruthy();
  });
});
