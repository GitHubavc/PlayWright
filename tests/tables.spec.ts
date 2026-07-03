import { test, expect } from '@playwright/test';

test.describe('Table automation scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .controls { margin-bottom: 12px; }
        button { margin-right: 8px; }
      </style>

      <h2>Static Table</h2>
      <table id="static-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Alice</td><td>Admin</td><td>Active</td></tr>
          <tr><td>Bob</td><td>Manager</td><td>Pending</td></tr>
          <tr><td>Carol</td><td>QA</td><td>Inactive</td></tr>
        </tbody>
      </table>

      <h2>Dynamic Table</h2>
      <div class="controls">
        <input id="filter" placeholder="Filter by name" />
        <button id="add-row">Add Row</button>
        <button id="remove-last">Remove Last</button>
        <button id="clear-all">Clear All</button>
        <button id="update-status">Update First Status</button>
      </div>

      <table id="dynamic-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="dynamic-body"></tbody>
      </table>
      <div id="empty-state" hidden>No data available</div>

      <script>
        const dynamicBody = document.getElementById('dynamic-body');
        const emptyState = document.getElementById('empty-state');
        const filterInput = document.getElementById('filter');
        let rows = [
          { name: 'Diana', role: 'Developer', status: 'Active' },
          { name: 'Evan', role: 'Designer', status: 'Pending' },
        ];

        function render() {
          const term = filterInput.value.trim().toLowerCase();
          const visibleRows = rows.filter((row) => row.name.toLowerCase().includes(term));
          dynamicBody.innerHTML = '';

          if (visibleRows.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3;
            cell.textContent = 'No matching rows';
            row.appendChild(cell);
            dynamicBody.appendChild(row);
            emptyState.hidden = false;
            return;
          }

          emptyState.hidden = true;
          visibleRows.forEach((rowData) => {
            const row = document.createElement('tr');
            row.innerHTML = '<td>' + rowData.name + '</td><td>' + rowData.role + '</td><td>' + rowData.status + '</td>';
            dynamicBody.appendChild(row);
          });
        }

        document.getElementById('add-row').addEventListener('click', () => {
          rows.push({ name: 'New User', role: 'Tester', status: 'Active' });
          render();
        });

        document.getElementById('remove-last').addEventListener('click', () => {
          if (rows.length > 0) {
            rows.pop();
          }
          render();
        });

        document.getElementById('clear-all').addEventListener('click', () => {
          rows = [];
          render();
        });

        document.getElementById('update-status').addEventListener('click', () => {
          if (rows.length > 0) {
            rows[0].status = 'Completed';
          }
          render();
        });

        filterInput.addEventListener('input', render);
        render();
      </script>
    `);
  });

  test('validates headers, row count, and cell values in a static table', async ({ page }) => {
    const headers = page.locator('#static-table thead th');
    await expect(headers).toHaveCount(3);
    await expect(headers.nth(0)).toHaveText('Name');
    await expect(headers.nth(1)).toHaveText('Role');
    await expect(headers.nth(2)).toHaveText('Status');

    const rows = page.locator('#static-table tbody tr');
    await expect(rows).toHaveCount(3);

    const secondRow = rows.nth(1);
    await expect(secondRow.locator('td').nth(0)).toHaveText('Bob');
    await expect(secondRow.locator('td').nth(1)).toHaveText('Manager');
    await expect(secondRow.locator('td').nth(2)).toHaveText('Pending');
  });

  test('handles a missing value scenario in a static table without failing', async ({ page }) => {
    const missingRow = page.locator('#static-table tbody tr').filter({ hasText: 'Zoe' });
    await expect(missingRow).toHaveCount(0);
    await expect(page.locator('#static-table tbody tr')).toHaveCount(3);
  });

  test('renders the initial dynamic table data correctly', async ({ page }) => {
    const rows = page.locator('#dynamic-table tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('Diana');
    await expect(rows.nth(0)).toContainText('Developer');
    await expect(rows.nth(0)).toContainText('Active');
    await expect(rows.nth(1)).toContainText('Evan');
    await expect(page.locator('#empty-state')).toBeHidden();
  });

  test('adds a new row to the dynamic table and verifies the new data', async ({ page }) => {
    await page.locator('#add-row').click();

    const rows = page.locator('#dynamic-table tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(2)).toContainText('New User');
    await expect(rows.nth(2)).toContainText('Tester');
    await expect(rows.nth(2)).toContainText('Active');
  });

  test('removes the last row and updates the table count', async ({ page }) => {
    await page.locator('#remove-last').click();

    const rows = page.locator('#dynamic-table tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0)).toContainText('Diana');
    await expect(rows.nth(0)).not.toContainText('Evan');
  });

  test('updates an existing row value and verifies the change', async ({ page }) => {
    await page.locator('#update-status').click();

    const firstRow = page.locator('#dynamic-table tbody tr').nth(0);
    await expect(firstRow).toContainText('Completed');
    await expect(firstRow).not.toContainText('Active');
  });

  test('filters the dynamic table and shows the empty state when no rows match', async ({ page }) => {
    await page.locator('#filter').fill('zoe');

    const rows = page.locator('#dynamic-table tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0)).toContainText('No matching rows');
    await expect(page.locator('#empty-state')).toBeVisible();
  });

  test('clears all rows and verifies the empty-state behavior', async ({ page }) => {
    await page.locator('#clear-all').click();

    const rows = page.locator('#dynamic-table tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0)).toContainText('No matching rows');
    await expect(page.locator('#empty-state')).toBeVisible();
  });
});
