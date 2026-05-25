import { test, expect } from '@playwright/test';

test.describe('Gestión de Historias de Usuario', () => {
  test('muestra la lista de historias y el botón de creación', async ({ page }) => {
    await page.goto('/stories');

    // Espera un segundo para asegurar la hidratación completa del island de React
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: 'User Stories', exact: true })).toBeVisible();
    await expect(page.locator('button:has-text("Escribir Historia de Usuario")')).toBeVisible();
  });
});
