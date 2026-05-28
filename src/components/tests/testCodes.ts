// Static dictionary containing literal JavaScript codes for Playwright E2E and Vitest Integration tests
// Source: testing.md (Parts 2 & 3)

export const e2eCodes: Record<string, string> = {
  'TC-01.1': `test('HU-01.1: Botón "Iniciar Reunión" es visible al cargar la app', async ({ page }) => {
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await expect(iniciarBtn).toBeVisible();
});`,

  'TC-01.2': `test('HU-01.2: Al presionar Iniciar, el navegador solicita permisos de micrófono', async ({ page, context }) => {
  // Mock del permiso de micrófono
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();

  // El navegador solicita permisos (se mockea arriba)
  // Verificar que la sesión se inicia
  const sesionActiva = page.locator('[data-testid="session-active-indicator"]');
  await expect(sesionActiva).toBeVisible();
});`,

  'TC-01.3': `test('HU-01.3: Sistema confirma visualmente que sesión está activa', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();

  const indicator = page.locator('[data-testid="session-status"]');
  await expect(indicator).toContainText('Activa');
  // Verificar color o clase CSS
  await expect(indicator).toHaveClass(/active/);
});`,

  'TC-01.4': `test('HU-01.4: Botón "Finalizar Reunión" es visible durante sesión activa', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();

  // Esperar a que botón Finalizar aparezca
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await expect(finalizarBtn).toBeVisible();
});`,

  'TC-01.5': `test('HU-01.5: Al presionar Finalizar, sesión se cierra y no se captura audio', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  // Iniciar
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();

  // Verificar sesión activa
  const indicator = page.locator('[data-testid="session-status"]');
  await expect(indicator).toContainText('Activa');

  // Finalizar
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();

  // Verificar sesión cerrada
  await expect(indicator).toContainText('Finalizada');
  await expect(finalizarBtn).not.toBeVisible();
});`,

  'TC-01.6': `test('HU-01.6: Botón Finalizar deshabilitado sin sesión activa', async ({ page }) => {
  await page.goto('http://localhost:4321/');
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');

  // No debe estar visible o debe estar deshabilitado
  const isVisible = await finalizarBtn.isVisible().catch(() => false);
  const isDisabled = await finalizarBtn.isDisabled().catch(() => false);
  expect(isVisible || isDisabled).toBeTruthy();
});`,

  'TC-02.1': `test('HU-02.1: Transcripción aparece en pantalla en tiempo real', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  // Iniciar sesión
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();

  // Área de transcripción debe estar visible
  const transcriptionArea = page.locator('[data-testid="transcription-area"]');
  await expect(transcriptionArea).toBeVisible();

  // Simular entrada de texto (mock de audio API)
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Hola, esto es una prueba de transcripción');
  });

  // Verificar que texto aparece
  await expect(transcriptionArea).toContainText('Hola, esto es una prueba');
});`,

  'TC-02.2': `test('HU-02.2: Transcripción muestra texto en orden cronológico', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  const transcriptionArea = page.locator('[data-testid="transcription-area"]');

  // Simular múltiples fragmentos de audio
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Primera frase');
    window.mockTranscriptUpdate('Segunda frase');
    window.mockTranscriptUpdate('Tercera frase');
  });

  // Verificar orden
  const text = await transcriptionArea.textContent();
  const firstIndex = text.indexOf('Primera');
  const secondIndex = text.indexOf('Segunda');
  const thirdIndex = text.indexOf('Tercera');
  expect(firstIndex < secondIndex && secondIndex < thirdIndex).toBeTruthy();
});`,

  'TC-02.3': `test('HU-02.3: Área de transcripción es desplazable', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  const transcriptionArea = page.locator('[data-testid="transcription-area"]');

  // Agregar mucho texto
  for (let i = 0; i < 20; i++) {
    await page.evaluate((i) => {
      window.mockTranscriptUpdate(\`Línea \${i}\`);
    }, i);
  }

  // Verificar que se puede hacer scroll
  const scrollHeight = await transcriptionArea.evaluate(el => el.scrollHeight);
  const clientHeight = await transcriptionArea.evaluate(el => el.clientHeight);
  expect(scrollHeight > clientHeight).toBeTruthy();
});`,

  'TC-02.4': `test('HU-02.4: Transcripción se detiene al presionar Finalizar', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  const transcriptionArea = page.locator('[data-testid="transcription-area"]');

  // Agregar texto
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Texto antes de finalizar');
  });

  // Finalizar
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();

  // El texto debe persistir pero no debe haber nuevos updates
  const textBefore = await transcriptionArea.textContent();

  // Intentar agregar más audio
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Este texto no debe aparecer');
  });

  const textAfter = await transcriptionArea.textContent();
  // Verificar que no se agregó nuevo texto
  expect(textAfter).toEqual(textBefore);
});`,

  'TC-02.5': `test('HU-02.5: Sistema funciona correctamente en Chrome', async ({ page, context, browserName }) => {
  if (browserName !== 'chromium') {
    test.skip();
  }
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await expect(iniciarBtn).toBeVisible();
  await iniciarBtn.click();

  const transcriptionArea = page.locator('[data-testid="transcription-area"]');
  await expect(transcriptionArea).toBeVisible();
});`,

  'TC-03.1': `test('HU-03.1: Sistema asigna etiquetas diferentes a hablantes', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  const transcriptionArea = page.locator('[data-testid="transcription-area"]');

  // Simular diarización (múltiples voces)
  await page.evaluate(() => {
    window.mockDiarizedTranscript('Hablante 1', 'Hola a todos');
    window.mockDiarizedTranscript('Hablante 2', 'Hola, ¿cómo están?');
  });

  await expect(transcriptionArea).toContainText('Hablante 1: Hola a todos');
  await expect(transcriptionArea).toContainText('Hablante 2: Hola, ¿cómo están?');
});`,

  'TC-03.2': `test('HU-03.2: Misma persona mantiene etiqueta consistente', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  const transcriptionArea = page.locator('[data-testid="transcription-area"]');

  // Simular orador recurrente
  await page.evaluate(() => {
    window.mockDiarizedTranscript('Hablante 1', 'Primera idea');
    window.mockDiarizedTranscript('Hablante 2', 'Respuesta');
    window.mockDiarizedTranscript('Hablante 1', 'Segunda idea');
  });

  const text = await transcriptionArea.textContent();
  const occurrences = (text.match(/Hablante 1/g) || []).length;
  expect(occurrences).toBe(2);
});`,

  'TC-04.1': `test('HU-04.1: Sistema muestra indicador de procesamiento', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();

  // Debe aparecer indicador de procesamiento LLM
  const processingIndicator = page.locator('[data-testid="llm-processing"]');
  await expect(processingIndicator).toBeVisible();
  await expect(processingIndicator).toContainText(/Procesando | Extrayendo/);
});`,

  'TC-04.2': `test('HU-04.2: Resumen extraído lista tareas con campos completos', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Juan debe revisar el código antes del viernes para el proyecto web');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();

  await page.waitForSelector('[data-testid="task-summary"]', { timeout: 10000 });
  const taskItem = page.locator('[data-testid="task-item"]').first();

  await expect(taskItem).toContainText(/revisar código/i);
  await expect(taskItem.locator('[data-field="responsable"]')).toBeVisible();
  await expect(taskItem.locator('[data-field="fecha"]')).toBeVisible();
});`,

  'TC-04.3': `test('HU-04.3: Usuario puede editar campos de tarea extraída', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Tarea original');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();
  await page.waitForSelector('[data-testid="task-summary"]');

  // Editar campo
  const editBtn = page.locator('[data-testid="task-edit"]').first();
  await editBtn.click();
  const inputField = page.locator('[data-field="descripcion-edit"]').first();
  await inputField.clear();
  await inputField.fill('Tarea modificada');
  const saveBtn = page.locator('[data-testid="edit-save"]').first();
  await saveBtn.click();

  const taskItem = page.locator('[data-testid="task-item"]').first();
  await expect(taskItem).toContainText('Tarea modificada');
});`,

  'TC-04.4': `test('HU-04.4: Usuario puede agregar nueva tarea manualmente', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Tarea automática');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();
  await page.waitForSelector('[data-testid="task-summary"]');

  // Agregar tarea manual
  const addBtn = page.locator('[data-testid="add-task-btn"]');
  await addBtn.click();
  const input = page.locator('[data-testid="new-task-input"]');
  await input.fill('Nueva tarea manual');
  const confirmBtn = page.locator('[data-testid="add-task-confirm"]');
  await confirmBtn.click();

  const tasks = page.locator('[data-testid="task-item"]');
  await expect(tasks).toContainText('Nueva tarea manual');
});`,

  'TC-04.5': `test('HU-04.5: Usuario puede eliminar tarea del resumen', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Tarea 1. Tarea 2. Tarea 3.');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();
  await page.waitForSelector('[data-testid="task-summary"]');

  const tasksBefore = await page.locator('[data-testid="task-item"]').count();
  const deleteBtn = page.locator('[data-testid="task-delete"]').first();
  await deleteBtn.click();

  const confirmDelete = page.locator('[data-testid="confirm-delete"]');
  if (await confirmDelete.isVisible()) {
    await confirmDelete.click();
  }

  const tasksAfter = await page.locator('[data-testid="task-item"]').count();
  expect(tasksAfter).toBeLessThan(tasksBefore);
});`,

  'TC-04.6': `test('HU-04.6: Al presionar Confirmar, tareas se guardan', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Tarea para guardar');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();
  await page.waitForSelector('[data-testid="task-summary"]');

  // Presionar Confirmar
  const confirmBtn = page.locator('[data-testid="confirm-summary-btn"]');
  await confirmBtn.click();

  const summary = page.locator('[data-testid="task-summary"]');
  await expect(summary).not.toBeVisible();

  const dashboard = page.locator('[data-testid="dashboard"]');
  await expect(dashboard).toBeVisible();
});`,

  'TC-05.1': `test('HU-05.1: Tareas aparecen en dashboard tras confirmar', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Tarea dashboard test');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();
  await page.waitForSelector('[data-testid="task-summary"]');
  const confirmBtn = page.locator('[data-testid="confirm-summary-btn"]');
  await confirmBtn.click();

  const dashboard = page.locator('[data-testid="dashboard"]');
  await expect(dashboard).toContainText('Tarea dashboard test');
});`,

  'TC-06.1': `test('HU-06.1: Tareas ordenadas por fecha vencimiento ascendente', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/tasks');

  const taskItems = page.locator('[data-testid="task-item"]');
  if (await taskItems.count() > 1) {
    const dates = await taskItems.locator('[data-field="fecha"]').allTextContents();
    const timestamps = dates.map(d => {
      if (d === 'Sin fecha') return Infinity;
      return new Date(d).getTime();
    });
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i] <= timestamps[i + 1]).toBeTruthy();
    }
  }
});`,

  'TC-06.2': `test('HU-06.2: Tareas sin fecha de vencimiento aparecen al final', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Tarea con fecha para el viernes');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();
  await page.waitForSelector('[data-testid="task-summary"]');
  const confirmBtn = page.locator('[data-testid="confirm-summary-btn"]');
  await confirmBtn.click();

  const dashboard = page.locator('[data-testid="dashboard"]');
  const taskItems = dashboard.locator('[data-testid="task-item"]');

  const lastTask = taskItems.last();
  const lastFecha = await lastTask.locator('[data-field="fecha"]').textContent();
  if (lastFecha === 'Sin fecha') {
    const count = await taskItems.count();
    for (let i = 0; i < count - 1; i++) {
      const f = await taskItems.nth(i).locator('[data-field="fecha"]').textContent();
      expect(f).not.toBe('Sin fecha');
    }
  }
});`,

  'TC-06.3': `test('HU-06.3: Cambios de estado persisten tras recarga', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/tasks');

  const taskItem = page.locator('[data-testid="task-item"]').first();
  const checkbox = taskItem.locator('input[type="checkbox"]');
  const checkedBefore = await checkbox.isChecked();

  // Marcar/Desmarcar
  await checkbox.click();
  const checkedAfter = await checkbox.isChecked();
  expect(checkedAfter).not.toBe(checkedBefore);

  // Recargar
  await page.reload();
  const checkboxReloaded = page.locator('[data-testid="task-item"]').first().locator('input[type="checkbox"]');
  expect(await checkboxReloaded.isChecked()).toBe(checkedAfter);
});`,

  'TC-07.1': `test('HU-07.1: Sistema distingue tareas de observaciones', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Nota: El cliente solicita cambiar color. Tarea: Kevin implementa base.');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();
  await page.waitForSelector('[data-testid="task-summary"]');

  // Separación tareas / observaciones
  const tasks = page.locator('[data-testid="task-item"]');
  const obs = page.locator('[data-testid="observation-item"]');
  await expect(tasks).toContainText('implementa base');
  await expect(obs).toContainText('cambiar color');
});`,

  'TC-07.2': `test('HU-07.2: Usuario puede acceder a observaciones desde sección dedicada', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/');
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  await iniciarBtn.click();
  await page.evaluate(() => {
    window.mockTranscriptUpdate('Nota de observación general');
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")');
  await finalizarBtn.click();
  
  // Ir a sección dedicada
  await page.click('a:has-text("Observaciones")');
  const list = page.locator('[data-testid="observations-list"]');
  await expect(list).toContainText('Nota de observación general');
});`,

  'TC-07.3': `test('HU-07.3: Observaciones no aparecen en panel de tareas', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);
  await page.goto('http://localhost:4321/tasks');
  const dashboard = page.locator('[data-testid="dashboard"]');
  
  // La palabra "Nota:" u observación no debe estar en panel de tareas
  const text = await dashboard.textContent();
  expect(text.includes('Nota de observación general')).toBeFalsy();
});`,
};

export const integrationCodes: Record<string, string> = {
  'INT-01.1': `test('INT-01.1: Audio se captura, transcribe y persiste correctamente', async () => {
  const audioStream = mockAudioDevice();
  const text = await Transcripcion.procesarFragmentoAudio(audioStream);
  expect(text).toBe('Hola mundo');

  const history = await db.saveTranscription(text);
  expect(history.text).toBe(text);
});`,

  'INT-01.2': `test('INT-01.2: Múltiples fragmentos se ordenan cronológicamente', async () => {
  const parts = ['Hola', 'cómo', 'estás'];
  for(const p of parts) {
    await Transcripcion.agregarTextoTranscripcion(p);
  }
  const full = await Transcripcion.obtenerTextoCompleto();
  expect(full).toBe('Hola cómo estás');
});`,

  'INT-01.3': `test('INT-01.3: Error en captura de audio no corrompe transcripción anterior', async () => {
  await Transcripcion.agregarTextoTranscripcion('Frase estable');
  await expect(Transcripcion.procesarFragmentoAudio(null)).rejects.toThrow();
  expect(await Transcripcion.obtenerTextoCompleto()).toBe('Frase estable');
});`,

  'INT-02.1': `test('INT-02.1: Transcripción completa se envía al LLM correctamente', async () => {
  const transcripcion = 'Christian debe validar el despliegue antes del lunes';
  const prompt = ExtractorLLM.construirPrompt(transcripcion);
  expect(prompt).toContain(transcripcion);

  const res = await ExtractorLLM.consultarLLM(prompt);
  expect(res.status).toBe(200);
});`,

  'INT-02.2': `test('INT-02.2: Tareas extraídas se guardan en BD correctamente', async () => {
  const lxml = { tareas: [{ descripcion: 'Test base', responsable: 'Kevin', fecha: '2026-05-30' }] };
  const items = ExtractorLLM.parsearRespuestaLLM(JSON.stringify(lxml));
  
  const saved = await db.insertarTareas(items.tareas);
  expect(saved[0].id).toBeDefined();
  expect(saved[0].estado).toBe('Pendiente');
});`,

  'INT-02.3': `test('INT-02.3: No se guardan tareas duplicadas del mismo LLM call', async () => {
  const task = { descripcion: 'Duplicado', responsable: 'Kevin', fecha: '2026-05-30' };
  await db.insertarTarea(task);
  await expect(db.insertarTarea(task)).rejects.toThrow(/duplicate/);
});`,

  'INT-02.4': `test('INT-02.4: Error en LLM no pierde datos de transcripción', async () => {
  const txt = 'Texto valioso';
  mockLLMError();
  await expect(ExtractorLLM.procesar(txt)).rejects.toThrow();
  expect(await db.obtenerTemporalTranscripcion()).toBe(txt);
});`,

  'INT-03.1': `test('INT-03.1: Tareas guardadas aparecen inmediatamente en dashboard', async () => {
  const task = await db.insertarTarea({ descripcion: 'Inmediata', estado: 'Pendiente' });
  const dashboardItems = await Dashboard.obtenerTareas();
  expect(dashboardItems.some(t => t.id === task.id)).toBeTruthy();
});`,

  'INT-03.2': `test('INT-03.2: Tareas se ordenan por fecha correctamente en dashboard', async () => {
  const items = await Dashboard.obtenerTareas();
  for (let i = 0; i < items.length - 1; i++) {
    expect(new Date(items[i].fecha).getTime() <= new Date(items[i+1].fecha).getTime()).toBeTruthy();
  }
});`,

  'INT-03.3': `test('INT-03.3: Marcar tarea como completada persiste en BD y dashboard', async () => {
  const task = await db.insertarTarea({ descripcion: 'Completar', estado: 'Pendiente' });
  await Dashboard.marcarCompletada(task.id);
  
  const dbTask = await db.obtenerTarea(task.id);
  expect(dbTask.estado).toBe('Completado');
});`,

  'INT-03.4': `test('INT-03.4: Recargar página no pierde datos del dashboard', async () => {
  const tBefore = await Dashboard.obtenerTareas();
  await Dashboard.recargar();
  const tAfter = await Dashboard.obtenerTareas();
  expect(tAfter).toEqual(tBefore);
});`,

  'INT-04.1': `test('INT-04.1: Items se clasifican correctamente como tarea u observación', async () => {
  const mix = 'Nota: Llamar cliente. Tarea: Hacer compilación.';
  const clasificados = Clasificador.clasificarItem(mix);
  expect(clasificados.find(c => c.texto.includes('Llamar')).tipo).toBe('OBSERVACION');
  expect(clasificados.find(c => c.texto.includes('Hacer')).tipo).toBe('TAREA');
});`,

  'INT-04.2': `test('INT-04.2: Tareas y observaciones se guardan en tablas separadas', async () => {
  const obsAntes = await db.contarObservaciones();
  await db.guardarObservacion({ texto: 'Obs de prueba', sesionId: 1 });
  const obsDespues = await db.contarObservaciones();
  expect(obsDespues).toBe(obsAntes + 1);
});`,

  'INT-04.3': `test('INT-04.3: Observaciones no aparecen en dashboard de tareas', async () => {
  const obs = await db.guardarObservacion({ texto: 'Obs Fantasma', sesionId: 1 });
  const tasks = await Dashboard.obtenerTareas();
  expect(tasks.some(t => t.descripcion === obs.texto)).toBeFalsy();
});`,

  'INT-04.4': `test('INT-04.4: Observaciones filtradas por sesión/reunión', async () => {
  const obs1 = await db.obtenerObservaciones({ sesionId: 1 });
  const obs2 = await db.obtenerObservaciones({ sesionId: 2 });
  expect(obs1[0].sesionId).not.toBe(obs2[0].sesionId);
});`,

  'INT-05.1': `test('INT-05.1: Múltiples reuniones en la misma sesión se aíslan correctamente', async () => {
  const r1 = await db.iniciarReunion(1);
  const r2 = await db.iniciarReunion(2);
  expect(r1.id).not.toBe(r2.id);
});`,

  'INT-05.2': `test('INT-05.2: Dashboard muestra TODAS las tareas ordenadas sin mezcla', async () => {
  const allTasks = await Dashboard.obtenerTodasLasTareas();
  expect(allTasks.length).toBeGreaterThanOrEqual(10);
});`,

  'INT-05.3': `test('INT-05.3: Observaciones vinculadas correctamente a su reunión origen', async () => {
  const obs1 = await db.obtenerObservaciones({ sesionId: 1 });
  expect(obs1[0].reunionId).toBe(1);
});`,

  'INT-05.4': `test('INT-05.4: Completar tarea de una reunión no afecta otras', async () => {
  const t1 = await db.insertarTarea({ descripcion: 'T1', sesionId: 1, estado: 'Pendiente' });
  const t2 = await db.insertarTarea({ descripcion: 'T2', sesionId: 2, estado: 'Pendiente' });
  await Dashboard.marcarCompletada(t1.id);

  expect((await db.obtenerTarea(t2.id)).estado).toBe('Pendiente');
});`,
};
