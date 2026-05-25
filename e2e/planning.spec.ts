import { test, expect } from '@playwright/test';

test.describe('Planificación de Iteraciones', () => {
  test('muestra el tablero de iteración con capacidad', async ({ page }) => {
    await page.goto('/planning');
    await expect(page.locator('#Backlog')).toBeVisible();
    await expect(page.locator('#Current')).toBeVisible();
  });
});
