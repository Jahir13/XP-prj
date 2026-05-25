import { test, expect } from '@playwright/test';

test.describe('Cuadro de Mando de Cumplimiento XP', () => {
  test('carga correctamente y muestra los elementos principales del cumplimiento', async ({ page }) => {
    // 1. Navegar a la página de cumplimiento
    await page.goto('/compliance');

    // Esperar a que el island de React esté completamente hidratado en el cliente
    await page.waitForTimeout(1500);

    // 2. Verificar el encabezado principal
    await expect(page.getByRole('heading', { name: 'Estado de Adopción de Prácticas XP' })).toBeVisible();
    await expect(page.getByText('Evaluación integral de cumplimiento metodológico')).toBeVisible();

    // 3. Verificar los contadores sintéticos de prácticas
    await expect(page.getByText('Prácticas Activas', { exact: true })).toBeVisible();
    await expect(page.getByText('9 / 12', { exact: true })).toBeVisible();
    await expect(page.getByText('Simuladas', { exact: true })).toBeVisible();
    await expect(page.getByText('3 / 12', { exact: true })).toBeVisible();

    // 4. Verificar la presencia del gráfico de radar SVG
    const radarChart = page.locator('svg[aria-label*="Gráfico de radar"]');
    await expect(radarChart).toBeVisible();

    // 5. Verificar que se rendericen las prácticas en la cuadrícula
    await expect(page.getByRole('heading', { name: 'Juego de la Planeación' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Programación en Parejas' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pruebas Automatizadas' })).toBeVisible();

    // 6. Verificar interacción con una práctica (abrir y cerrar modal)
    // Filtramos los botones por texto para evitar conflictos con descripciones largas
    await page.getByRole('button').filter({ hasText: 'Juego de la Planeación' }).first().click();

    // Esperar y verificar que el diálogo de detalles esté visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Juego de la Planeación' }).nth(1)).toBeVisible();
    await expect(page.getByText('Evidencia Técnica Encontrada')).toBeVisible();

    // Cerrar el modal con el botón 'Entendido'
    await page.getByRole('button', { name: 'Entendido' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 7. Verificar cambio de pestañas en la línea de tiempo del ciclo de vida
    await expect(page.getByRole('heading', { name: 'Fase de Planeación' })).toBeVisible();

    // Hacemos clic usando exact: true para evitar colisionar con sub-textos de tarjetas
    await page.getByRole('button', { name: 'Diseño', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Fase de Diseño' })).toBeVisible();
    await expect(page.getByText('Glosario de Nombres Comunes')).toBeVisible();

    await page.getByRole('button', { name: 'Pruebas', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Fase de Pruebas' })).toBeVisible();
    await expect(page.getByText('Suite de Pruebas Unitarias (Vitest)')).toBeVisible();
  });
});
