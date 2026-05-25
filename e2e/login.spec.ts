import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('muestra la página de inicio de sesión', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('muestra un error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'wrong@test.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('#login-error')).toBeVisible();
  });
});
