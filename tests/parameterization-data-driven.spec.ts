/// <reference types="node" />

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

type UserRecord = {
  name: string;
  role: string;
};

function readJsonUsers(filePath: string): UserRecord[] {
  // JSON-driven testing: read the data from a JSON file and use it as test input.
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as UserRecord[];
}

function readCsvUsers(filePath: string): UserRecord[] {
  // CSV-driven testing: parse a simple comma-separated file into rows.
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.trim().split(/\r?\n/);
  const [, ...rows] = lines;

  return rows.map((line: string) => {
    const [name, role] = line.split(',');
    return { name: name.trim(), role: role.trim() };
  });
}

function readExcelUsers(filePath: string): UserRecord[] {
  // Excel-driven testing: load a workbook and read the first sheet.
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet) as Array<{ name: string; role: string }>;

  return rows.map(({ name, role }) => ({ name, role }));
}

test.describe('Parameterization and data-driven testing', () => {
  test('uses JSON data as test input', async ({ page }) => {
    const users = readJsonUsers(path.resolve(__dirname, '../test-data/json/users.json'));

    // Parameterization means the same test logic runs with different inputs.
    // In this case, the JSON file supplies multiple user records.
    await page.setContent(`<ul>${users.map((user) => `<li>${user.name} - ${user.role}</li>`).join('')}</ul>`);

    await expect(page.locator('li')).toHaveCount(users.length);
    await expect(page.locator('li').first()).toContainText('Alice - Admin');
  });

  test('uses CSV data as test input', async ({ page }) => {
    const users = readCsvUsers(path.resolve(__dirname, '../test-data/csv/users.csv'));

    // A CSV file is a common source of test data for data-driven testing.
    await page.setContent(`<ul>${users.map((user) => `<li>${user.name} - ${user.role}</li>`).join('')}</ul>`);

    await expect(page.locator('li')).toHaveCount(users.length);
    await expect(page.locator('li').nth(1)).toContainText('Bob - Editor');
  });

  test('uses Excel data as test input', async ({ page }) => {
    const users = readExcelUsers(path.resolve(__dirname, '../test-data/excel/users.xlsx'));

    // Excel is often used for larger datasets that need to be maintained outside the test code.
    await page.setContent(`<ul>${users.map((user) => `<li>${user.name} - ${user.role}</li>`).join('')}</ul>`);

    await expect(page.locator('li')).toHaveCount(users.length);
    await expect(page.locator('li').last()).toContainText('Charlie - Viewer');
  });
});
