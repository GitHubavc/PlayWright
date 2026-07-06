import { test, expect } from '@playwright/test';

test.describe('Iframes and nested frames', () => {
  test('interacts with a single iframe', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Main page</h1>
          <iframe id="single-frame" name="single-frame" srcdoc="
            <!DOCTYPE html>
            <html>
              <body>
                <h2>Iframe content</h2>
                <input id='name' />
                <button id='submit'>Submit</button>
                <div id='result'></div>
                <script>
                  document.getElementById('submit').addEventListener('click', () => {
                    document.getElementById('result').textContent = 'Hello ' + document.getElementById('name').value;
                  });
                </script>
              </body>
            </html>"></iframe>
        </body>
      </html>
    `);

    const frame = page.frame({ name: 'single-frame' });
    expect(frame).not.toBeNull();

    await expect(frame!.locator('h2')).toHaveText('Iframe content');
    await frame!.locator('#name').fill('Playwright');
    await frame!.locator('#submit').click();
    await expect(frame!.locator('#result')).toHaveText('Hello Playwright');
  });

  test('handles nested frames and switches between parent and child frames', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Parent page</h1>
          <iframe id="top-frame" name="top-frame" srcdoc="
            <!DOCTYPE html>
            <html>
              <body>
                <h2>Top frame</h2>
                <iframe id='left-frame' name='left-frame' srcdoc='<!DOCTYPE html><html><body><p id=left>Left child</p></body></html>'></iframe>
                <iframe id='right-frame' name='right-frame' srcdoc='<!DOCTYPE html><html><body><p id=right>Right child</p></body></html>'></iframe>
              </body>
            </html>"></iframe>
          <iframe id="bottom-frame" name="bottom-frame" srcdoc="<!DOCTYPE html><html><body><p id='bottom'>Bottom frame</p></body></html>"></iframe>
        </body>
      </html>
    `);

    const topFrame = page.frame({ name: 'top-frame' });
    expect(topFrame).not.toBeNull();

    const childFrames = topFrame!.childFrames();
    expect(childFrames).toHaveLength(2);

    const leftFrame = childFrames.find((frame) => frame.name() === 'left-frame');
    const rightFrame = childFrames.find((frame) => frame.name() === 'right-frame');
    expect(leftFrame).toBeDefined();
    expect(rightFrame).toBeDefined();

    await expect(topFrame!.locator('h2')).toHaveText('Top frame');
    await expect(leftFrame!.locator('#left')).toHaveText('Left child');
    await expect(rightFrame!.locator('#right')).toHaveText('Right child');

    expect(leftFrame!.parentFrame()).toBe(topFrame);
    expect(topFrame!.parentFrame()).toBe(page.mainFrame());
  });

  test('uses frameLocator for nested content and returns to the parent page', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Parent page</h1>
          <iframe id="outer-frame" name="outer-frame" srcdoc="
            <!DOCTYPE html>
            <html>
              <body>
                <h2>Outer frame</h2>
                <iframe id='inner-frame' name='inner-frame' srcdoc='<!DOCTYPE html><html><body><p id=child>Nested child</p></body></html>'></iframe>
              </body>
            </html>"></iframe>
        </body>
      </html>
    `);

    const outerFrame = page.frameLocator('#outer-frame');
    await expect(outerFrame.locator('h2')).toHaveText('Outer frame');

    const innerFrame = outerFrame.frameLocator('#inner-frame');
    await expect(innerFrame.locator('#child')).toHaveText('Nested child');
    await expect(page.locator('h1')).toHaveText('Parent page');
  });
});
