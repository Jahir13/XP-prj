import { test, expect } from '@playwright/test';

test.describe('Standup Diaria', () => {
  test('muestra el formulario de standup con cronómetro', async ({ page }) => {
    await page.goto('/standup');

    // Espera un segundo para asegurar la hidratación completa del island de React
    await page.waitForTimeout(1000);

    await expect(page.locator('#standup-timer')).toBeVisible();

    // Hace clic de manera segura en el primer miembro del equipo usando locator por rol
    await page
      .getByRole('button', { name: /Christian/i })
      .first()
      .click();

    await expect(page.locator('#standup-yesterday')).toBeVisible();
    await expect(page.locator('#standup-today')).toBeVisible();
  });
});
