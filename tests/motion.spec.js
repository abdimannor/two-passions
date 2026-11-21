// Motion button in a browser that asks for reduced motion: motion stays on by default.
const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

const toggle = '[data-motion-toggle]';
const shown = (page) => page.evaluate(() =>
  [...document.querySelectorAll('.passion-card picture img')].map((img) => img.currentSrc.split('/').pop()));

test('moving by default, off after the button, remembered after reload', async ({ page }) => {
  await page.goto('./');
  const html = page.locator('html');
  const button = page.locator(toggle);
  await expect(html).toHaveAttribute('data-motion', 'on');
  await expect(button).toBeVisible();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAccessibleName('Pausa rörelse');
  await page.locator('.passion-card picture img').first().scrollIntoViewIfNeeded();
  await expect.poll(() => shown(page)).toEqual(['poetry-writing.webp', 'boxing-motion.webp']);
  await button.click();
  await expect(html).toHaveAttribute('data-motion', 'off');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).toHaveAccessibleName('Starta rörelse');
  await page.reload();
  await expect(html).toHaveAttribute('data-motion', 'off');
  await page.locator('.passion-card picture img').last().scrollIntoViewIfNeeded();
  await expect.poll(() => shown(page)).toEqual(['poetry-writing-still.jpg', 'boxing-motion-still.jpg']);
  await button.click();
  await expect(html).toHaveAttribute('data-motion', 'on');
  await page.reload();
  await expect(html).toHaveAttribute('data-motion', 'on');
});
