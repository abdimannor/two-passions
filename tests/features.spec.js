// Round indicator, tempo persistence and the poster download.
const { test, expect } = require('@playwright/test');

test('round indicator follows scroll through the bout', async ({ page }) => {
  await page.goto('./');
  const rounds = page.locator('li[data-round]');
  await expect(rounds).toHaveCount(3);
  const current = () => page.locator('li[data-round][aria-current="step"]').getAttribute('data-round');
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const seen = new Set();
  for (let i = 0; i <= 40; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (max * i) / 40);
    await page.waitForTimeout(30);
    const r = await page.locator('li[data-round][aria-current="step"]').count() ? await current() : null;
    if (r) seen.add(r);
  }
  expect([...seen].sort()).toEqual(['1', '2', '3']);
});

test('tempo is kept after reload', async ({ page }) => {
  await page.goto('./');
  const tempo = page.locator('[data-tempo]');
  await page.evaluate(() => { const m = document.querySelector('[data-more-toggle]'); if (m && !m.hidden) m.click(); });
  await tempo.fill('130');
  await expect(page.locator('[data-tempo-out]')).toContainText('130');
  await page.reload();
  await expect(page.locator('[data-tempo]')).toHaveValue('130');
});

test('poster button downloads a PNG', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => { const m = document.querySelector('[data-more-toggle]'); if (m && !m.hidden) m.click(); });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-poster]').click(),
  ]);
  expect(download.suggestedFilename()).toBe('two-passions-affisch.png');
});

test('sound is a quiet icon button that swaps its name and icon', async ({ page }) => {
  await page.goto('./');
  const sound = page.getByRole('button', { name: 'Slå på ljud' });
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await expect(sound).toHaveAttribute('title', 'Slå på ljud');
  const box = await sound.boundingBox();
  expect(Math.round(box.width)).toBe(34);
  expect(Math.round(box.height)).toBe(34);
  await expect(sound.locator('.icon-sound-off')).toBeVisible();
  await expect(sound.locator('.icon-sound-on')).toBeHidden();
  await sound.click();
  const off = page.getByRole('button', { name: 'Stäng av ljud' });
  await expect(off).toHaveAttribute('aria-pressed', 'true');
  await expect(off).toHaveAttribute('title', 'Stäng av ljud');
  await expect(off.locator('.icon-sound-on')).toBeVisible();
  await off.click();
  await expect(page.getByRole('button', { name: 'Slå på ljud' })).toHaveAttribute('aria-pressed', 'false');
});
