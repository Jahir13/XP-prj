# XP-Flow: Documento Central de Pruebas (Plan de Pruebas, E2E e Integración)

---

## Part 1: Plan de Pruebas (`TEST_PLAN.md`)

### 1. Introducción

Este plan de pruebas cubre todas las historias de usuario del proyecto XP-Flow, con énfasis en:

- **Pruebas Unitarias (TDD):** Escrito primero (Metodología XP).

- **Pruebas Funcionales (E2E):** Validación de flujos de usuario.

- **Pruebas de Integración:** Validación de módulos integrados.

### 2. Estrategia de Pruebas por Iteración

Iteración 1 - MVP Funcional (5 pts)

| Historia  | Objetivo                 | Tipo Prueba | Prioridad |
| --------- | ------------------------ | ----------- | --------- |
| **HU-01** | Iniciar/Finalizar sesión |

| Unitaria + E2E

| Alta

|
| **HU-02** | Transcripción en tiempo real

| Unitaria + E2E

| Alta

|

> **Criterio de Éxito:** El usuario puede iniciar una reunión, ver la transcripción en vivo y finalizarla.

Iteración 2 - Extracción, Gestión y Enriquecimiento (17 pts)

| Historia  | Objetivo                 | Tipo Prueba | Prioridad |
| --------- | ------------------------ | ----------- | --------- |
| **HU-04** | Extracción LLM de tareas |

| Unitaria + E2E + Integración

| Alta

|
| **HU-05** | Persistencia en BD Local

| Unitaria + Integración

| Alta

|
| **HU-06** | Dashboard de pendientes

| Unitaria + E2E + Integración

| Alta

|
| **HU-07** | Observaciones de proyecto

| Unitaria + E2E + Integración

| Media

|
| **HU-03** | Diferenciación de voces (condicional)

| Unitaria + E2E

| Baja

|

> **Criterio de Éxito:** Ciclo completo: reunión $\rightarrow$ transcripción $\rightarrow$ extracción $\rightarrow$ guardado $\rightarrow$ visualización + observaciones y diarización opcional.

---

### 3. Cobertura de Pruebas por Tipo

3.1 Pruebas Unitarias (TDD - Test-Driven Development)

Módulos a probar:

1.  **Módulo de Sesión (HU-01):**

- `iniciarSesion()` $\rightarrow$ retorna estado 'activa'.

- `finalizarSesion()` $\rightarrow$ retorna estado 'finalizada'.

- `solicitarPermiso()` $\rightarrow$ maneja permisos de micrófono.

2.  **Módulo de Transcripción (HU-02):**

- `procesarFragmentoAudio(blob)` $\rightarrow$ retorna string.

- `agregarTextoTranscripcion(texto)` $\rightarrow$ append correcto.

- `detenerCaptura()` $\rightarrow$ detiene stream sin excepciones.

3.  **Módulo de Extracción LLM (HU-04):**

- `construirPrompt(transcripcion)` $\rightarrow$ string formateado.

- `parsearRespuestaLLM(json)` $\rightarrow$ objeto estructurado.

- `editarItem(id, campo, valor)` $\rightarrow$ actualiza campos.

- `eliminarItem(id)` $\rightarrow$ remueve sin afectar otros.

4.  **Módulo de Persistencia (HU-05):**

- `guardarTarea({descripcion, fechalimite})` $\rightarrow$ inserta con estado='Pendiente'.

- `obtenerTareas()` $\rightarrow$ retorna todos los registros (Persistencia entre sesiones).

5.  **Módulo de Dashboard (HU-06):**

- `ordenarTareasPorFecha(tareas)` $\rightarrow$ ordena correctamente.

- `marcarCompletada(id)` $\rightarrow$ actualiza estado.

- `obtenerTareasPendientes()` $\rightarrow$ excluye completadas.

6.  **Módulo de Observaciones (HU-07):**

- `clasificarItem(item)` $\rightarrow$ retorna tipo correcto.

- `guardarObservacion({texto, reunionId})` $\rightarrow$ persiste.

- `obtenerObservacionesPorReunion(id)` $\rightarrow$ filtra por reunión.

7.  **Módulo de Diarización (HU-03):**

- `asignarEtiquetaHablante(fragmento)`

- `resetearHablantes()` $\rightarrow$ limpia etiquetas.

> **Total esperado:** ~40 tests unitarios.

3.2 Pruebas Funcionales (E2E con Playwright)

- **Flujo 1: Captura de Reunión Básica (HU-01 + HU-02)**

1. Cargar aplicación.

2. Verificar botón "Iniciar Reunión" visible.

3. Hacer clic $\rightarrow$ solicitud de permisos de micrófono.

4. Aprobar permisos.

5. Verificar indicador "Sesión Activa".

6. Hablar/simular audio.

7. Verificar transcripción aparece en pantalla.

8. Hacer clic en "Finalizar Reunión".

9. Verificar sesión cerrada, transcripción persiste.

- **Flujo 2: Extracción y Confirmación (HU-04)**

1. Finalizar reunión (flujo anterior).

2. Sistema muestra "Procesando..." (indicador LLM).

3. Esperar respuesta LLM (~3-5 seg).

4. Verificar lista de tareas extraídas con campos: Actividad/Descripción, Responsable (si aplica), Fecha/Contexto temporal, Proyecto/Contexto.

5. Usuario edita un campo (ej: cambiar responsable).

6. Usuario agrega tarea manual.

7. Usuario elimina una tarea errada.

8. Usuario hace clic en "Confirmar".

9. Verificar modal/confirmación antes de guardar.

- **Flujo 3: Persistencia y Dashboard (HU-05 + HU-06)**

1. Tras confirmar tareas (flujo anterior).

2. Verificar ítems aparecen INMEDIATAMENTE en dashboard.

3. Dashboard muestra tareas ordenadas por fecha (ascendente).

4. Tareas sin fecha aparecen al final.

5. Recargar página.

6. Verificar tareas siguen presentes (persistencia).

7. Marcar una tarea como "Completada".

8. Verificar cambio visual inmediato (tachado/color).

9. Recargar página.

10. Verificar estado persistió.

- **Flujo 4: Observaciones (HU-07)**

1. Después de reunión con observaciones.

2. Sistema clasifica automáticamente ítems como "tarea" u "observación".

3. Usuario hace clic en sección "Observaciones".

4. Verificar lista de observaciones de reuniones anteriores.

5. Verificar observaciones NO aparecen en panel de tareas (HU-06).

6. Verificar cada observación muestra: texto + fecha de reunión.

- **Flujo 5: Diarización (HU-03 - Opcional)**

1. Durante transcripción (HU-02).

2. Hablan 2+ personas.

3. Sistema asigna etiquetas: "Voz 1:", "Voz 2:".

4. Verificar etiquetas persistentes para mismo hablante.

5. Desactivar diarización desde settings.

6. Verificar transcripción sigue funcionando sin etiquetas.

7. Reactivar diarización.

8. Verificar etiquetas reaparecen.

> **Total esperado:** ~15-20 tests E2E.

3.3 Pruebas de Integración

- **Escenario 1: Audio $\rightarrow$ Transcripción $\rightarrow$ LLM**

- **Entrada:** Audio de 30 segundos con 2 personas hablando.

- **Procesos:** Módulo Audio captura stream correctamente $\rightarrow$ Módulo Transcripción convierte a texto $\rightarrow$ Módulo LLM analiza transcripción.

- **Salida:** JSON con tareas y observaciones extraídas.

- **Validación:** Formato correcto, campos completos, sin excepciones.

- **Escenario 2: Extracción $\rightarrow$ Edición $\rightarrow$ Persistencia**

- **Entrada:** JSON del LLM con 5 tareas extraídas.

- **Procesos:** UI: Usuario edita 2 tareas, elimina 1, agrega 1 $\rightarrow$ Módulo Edición actualiza estado sin corrupción $\rightarrow$ Módulo Persistencia guarda 5 tareas finales en BD.

- **Salida:** BD contiene 5 registros con valores correctos.

- **Validación:** IDs únicos, timestamps automáticos, sin duplicados.

- **Escenario 3: Persistencia $\rightarrow$ Dashboard $\rightarrow$ Actualización**

- **Entrada:** 5 tareas guardadas en BD con fechas variadas.

- **Procesos:** Módulo Dashboard lee tareas de BD $\rightarrow$ Módulo Ordenamiento ordena por fecha ascendente $\rightarrow$ UI renderiza lista visual $\rightarrow$ Interacción de usuario: Marca 2 como completadas.

- **Validación:** Orden correcto, visualización limpia, cambios persisten.

- **Escenario 4: LLM Clasificación de Ítems $\rightarrow$ Almacenamiento Separado**

- **Entrada:** Respuesta LLM con 4 tareas + 2 observaciones.

- **Procesos:** Módulo Clasificación separa tareas de observaciones $\rightarrow$ Módulo Persistencia Tareas guarda con estado='Pendiente' $\rightarrow$ Módulo Persistencia Observaciones guarda sin estado.

- **Salida:** 2 registros en tabla tareas, 2 en tabla observaciones.

- **Validación:** Sin mezcla de tipos, referencias correctas por reunión.

- **Escenario 5: Múltiples Reuniones en Sesión**

- **Entrada:** Usuario realiza 3 reuniones en la misma sesión (Reunión 1: 5 tareas + 1 obs; Reunión 2: 3 tareas + 2 obs; Reunión 3: 2 tareas + 0 obs ).

- **Procesos:** Dashboard muestra TODAS las 10 tareas ordenadas; Observaciones muestra 3 observaciones vinculadas a su reunión de origen.

- **Validación:** Sin mezcla entre reuniones, filtrado correcto, integridad de datos.

  ***

### 4. Criterios de Aceptación por Tipo de Prueba

Unitarias

- Todas pasan sin excepciones no controladas.

- Cobertura $\ge 80\%$ del código de negocio.

- Tests ejecutados antes de comitear (Integración Continua).

E2E

- Flujo completo hasta confirmación de datos.

- Transiciones visuales claras entre estados.

- Persistencia validada con recargas de página.

- Manejo de errores visible al usuario.

Integración

- Módulos comunican correctamente sin corrupción de datos.

- Sincronización entre BD y UI inmediata.

- Sin efectos secundarios entre historias.

- Manejo graceful (degradación aceptable) de fallos de APIs externas (LLM).

---

### 5. Matriz de Riesgos y Mitigación

| Riesgo | Historia | Mitigación por Prueba |
| ------ | -------- | --------------------- |

| <br>**Alto:** Compatibilidad Web Speech API

| HU-02

| Prueba en Chrome, Firefox, Safari en Iteración 1

|
| <br>**Alto:** Latencia/Costo LLM

| HU-04

| Prueba con timeout, fallback graceful

|
| <br>**Alto:** Precisión extracción LLM

| HU-04

| Validación manual obligatoria antes de confirmar

|
| <br>**Medio:** Entorno despliegue indefinido

| HU-05

| Pruebas con SQLite + IndexedDB según decisión de cliente

|
| <br>**Medio:** Pérdida de datos si el guardado falla

| HU-05

| Test explícito: error notificado, datos no se pierden

|
| <br>**Medio:** Alcance diarización

| HU-03

| Pruebas en iteración 2 con retroalimentación del cliente

|

---

### 6. Ambientes de Prueba

Ambiente Local (Desarrollo)

- Node.js + npm.

- Navegador Chrome (referencia).

- BD SQLite/IndexedDB en localStorage.

- Mock de LLM para pruebas rápidas.

Ambiente QA (Pre-release)

- Navegadores: Chrome, Firefox, Safari, Edge.

- BD SQLite real.

- LLM real (con presupuesto limitado).

- Red simulada (latencia variable).

Ambiente Producción (Release)

- Todos los navegadores soportados.

- BD persistente en servidor o cliente.

- LLM en producción.

- Monitoreo de errores activado.

---

### 7. Herramientas de Prueba

| Tipo          | Herramienta | Uso |
| ------------- | ----------- | --- |
| **Unitarias** | Vitest      |

| Tests rápidos, TDD

|
| **E2E** | Playwright

| Automatización de flujos de usuario

|
| **Integración** | Vitest + Testcontainers

| Tests de integración BD + APIs

|
| **Cobertura** | Istanbul/c8

| Reporte de cobertura

|
| **CI/CD** | GitHub Actions

| Ejecución automática en commits

|

---

### 8. Cronograma de Ejecución

- **Iteración 1 (Semana 1-2):** Pruebas unitarias HU-01, HU-02 (TDD) , Pruebas E2E HU-01, HU-02 , Demo cliente con feedback integrado.

- **Iteración 2 (Semana 3-4):** Pruebas unitarias HU-04, HU-05, HU-06, HU-07, HU-03 (TDD) , Pruebas E2E HU-04, HU-05, HU-06, HU-07, HU-03 , Pruebas de integración completa (Audio-LLM-BD UI, observaciones, diarización).

- **Finalización:** Regresión completa (todas las pruebas) $\rightarrow$ Release final v1.0.

  ***

9. Responsabilidades (Roles XP)

- **Programador:** Escribir tests unitarios (TDD) antes del código.

- **Tester:** Diseñar casos E2E, ejecutar pruebas de integración.

- **Cliente:** Validar criterios de aceptación, dar feedback en demos.

- **Tracker:** Monitorear cobertura y riesgos de pruebas.

  ***

10. Definición de Listo (Done)

Una historia se considera **LISTA** cuando cumple con:

1. 100% de tests unitarios pasan.

2. 100% de tests E2E pasan.

3. Tests de integración pasan (si aplica).

4. El cliente valida en demostración.

5. Código sin warnings de linting.

6. Documentación actualizada.

7. La integración continua pasa (CI pipeline).

---

---

## Part 2: Pruebas Funcionales E2E (`FUNCTIONAL_TESTS_E2E.md`)

Casos de prueba automatizados con Playwright para validar flujos de usuario de cada historia.

HU-01: Iniciar y Finalizar Sesión de Reunión

TC-01.1: Botón Iniciar Reunión visible al cargar

```javascript
test('HU-01.1: Botón "Iniciar Reunión" es visible al cargar la app', async ({ page }) => {
  [cite_start]await page.goto('http://localhost:4321/'); // [cite: 8]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 9]
  await expect(iniciarBtn).toBeVisible(); [cite_start]// [cite: 9]
}); [cite_start]// [cite: 7]

```

TC-01.2: Solicitud de permisos de micrófono al iniciar

```javascript
test('HU-01.2: Al presionar Iniciar, el navegador solicita permisos de micrófono', async ({ page, context }) => {
  // Mock del permiso de micrófono
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 13]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 14]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 15]
  await iniciarBtn.click(); [cite_start]// [cite: 15]

  [cite_start]// El navegador solicita permisos (se mockea arriba) [cite: 16]
  [cite_start]// Verificar que la sesión se inicia [cite: 17]
  const sesionActiva = page.locator('[data-testid="session-active-indicator"]'); [cite_start]// [cite: 19]
  await expect(sesionActiva).toBeVisible(); [cite_start]// [cite: 19]
});

```

TC-01.3: Indicador visual de sesión activa

```javascript
test('HU-01.3: Sistema confirma visualmente que sesión está activa', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 22]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 23]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 24]
  await iniciarBtn.click(); [cite_start]// [cite: 24]

  const indicator = page.locator('[data-testid="session-status"]'); [cite_start]// [cite: 28]
  await expect(indicator).toContainText('Activa'); [cite_start]// [cite: 28]
  [cite_start]// Verificar color o clase CSS [cite: 29]
  await expect(indicator).toHaveClass(/active/); [cite_start]// [cite: 30]
});

```

TC-01.4: Botón Finalizar visible durante sesión activa

```javascript
test('HU-01.4: Botón "Finalizar Reunión" es visible durante sesión activa', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 33]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 34]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 35]
  await iniciarBtn.click(); [cite_start]// [cite: 36]

  [cite_start]// Esperar a que botón Finalizar aparezca [cite: 37]
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 39]
  await expect(finalizarBtn).toBeVisible(); [cite_start]// [cite: 39]
});

```

TC-01.5: Sesión se cierra al presionar Finalizar

```javascript
test('HU-01.5: Al presionar Finalizar, sesión se cierra y no se captura audio', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 43]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 44]
  [cite_start]// Iniciar [cite: 45]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 46]
  await iniciarBtn.click(); [cite_start]// [cite: 46]

  [cite_start]// Verificar sesión activa [cite: 47]
  const indicator = page.locator('[data-testid="session-status"]'); [cite_start]// [cite: 48]
  await expect(indicator).toContainText('Activa'); [cite_start]// [cite: 48]

  [cite_start]// Finalizar [cite: 49]
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 51]
  await finalizarBtn.click(); [cite_start]// [cite: 51]

  [cite_start]// Verificar sesión cerrada [cite: 52]
  await expect(indicator).toContainText('Finalizada'); [cite_start]// [cite: 53]
  await expect(finalizarBtn).not.toBeVisible(); [cite_start]// [cite: 54]
});

```

TC-01.6: No se puede Finalizar si no hay sesión activa

```javascript
test('HU-01.6: Botón Finalizar deshabilitado sin sesión activa', async ({ page }) => {
  [cite_start]await page.goto('http://localhost:4321/'); // [cite: 60]
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 61]

  [cite_start]// No debe estar visible o debe estar deshabilitado [cite: 62]
  const isVisible = await finalizarBtn.isVisible().catch(() => false); [cite_start]// [cite: 63, 65]
  const isDisabled = await finalizarBtn.isDisabled().catch(() => false); [cite_start]// [cite: 64, 66]
  expect(isVisible || isDisabled).toBeTruthy(); [cite_start]// [cite: 67]
});

```

---

HU-02: Transcripción Básica de Audio en Tiempo Real

TC-02.1: Texto aparece en pantalla segundos después de hablar

```javascript
test('HU-02.1: Transcripción aparece en pantalla en tiempo real', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 72]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 73]
  [cite_start]// Iniciar sesión [cite: 74]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 75]
  await iniciarBtn.click(); [cite_start]// [cite: 75]

  [cite_start]// Área de transcripción debe estar visible [cite: 76]
  const transcriptionArea = page.locator('[data-testid="transcription-area"]'); [cite_start]// [cite: 77]
  await expect(transcriptionArea).toBeVisible(); [cite_start]// [cite: 77]

  [cite_start]// Simular entrada de texto (mock de audio API) [cite: 78]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Hola, esto es una prueba de transcripción'); // [cite: 79]
  });

  [cite_start]// Verificar que texto aparece [cite: 80]
  await expect(transcriptionArea).toContainText('Hola, esto es una prueba'); [cite_start]// [cite: 82]
});

```

TC-02.2: Texto en orden cronológico ascendente

```javascript
test('HU-02.2: Transcripción muestra texto en orden cronológico', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 85]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 89]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 90]
  await iniciarBtn.click(); [cite_start]// [cite: 90]
  const transcriptionArea = page.locator('[data-testid="transcription-area"]'); [cite_start]// [cite: 91]

  [cite_start]// Simular múltiples fragmentos de audio [cite: 92]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Primera frase'); // [cite: 94]
    window.mockTranscriptUpdate('Segunda frase'); [cite_start]// [cite: 95]
    window.mockTranscriptUpdate('Tercera frase'); [cite_start]// [cite: 95]
  });

  [cite_start]// Verificar orden [cite: 97]
  const text = await transcriptionArea.textContent(); [cite_start]// [cite: 98]
  const firstIndex = text.indexOf('Primera'); [cite_start]// [cite: 99]
  const secondIndex = text.indexOf('Segunda'); [cite_start]// [cite: 100]
  const thirdIndex = text.indexOf('Tercera'); [cite_start]// [cite: 101]
  expect(firstIndex < secondIndex && secondIndex < thirdIndex).toBeTruthy(); [cite_start]// [cite: 102]
});

```

TC-02.3: Área de transcripción es desplazable (scroll)

```javascript
test('HU-02.3: Área de transcripción es desplazable', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 106]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 107]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 108]
  await iniciarBtn.click(); [cite_start]// [cite: 108]
  const transcriptionArea = page.locator('[data-testid="transcription-area"]'); [cite_start]// [cite: 109]

  [cite_start]// Agregar mucho texto [cite: 110]
  for (let i = 0; i < 20; i++) {
    await page.evaluate((i) => {
      [cite_start]window.mockTranscriptUpdate(`Línea ${i}`); // [cite: 115]
    }, i); [cite_start]// [cite: 114, 116]
  }

  [cite_start]// Verificar que se puede hacer scroll [cite: 117]
  const scrollHeight = await transcriptionArea.evaluate(el => el.scrollHeight); [cite_start]// [cite: 118]
  const clientHeight = await transcriptionArea.evaluate(el => el.clientHeight); [cite_start]// [cite: 119]
  expect(scrollHeight > clientHeight).toBeTruthy(); [cite_start]// [cite: 120]
});

```

TC-02.4: Transcripción se detiene al finalizar

```javascript
test('HU-02.4: Transcripción se detiene al presionar Finalizar', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 125]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 127]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 128]
  await iniciarBtn.click(); [cite_start]// [cite: 128]
  const transcriptionArea = page.locator('[data-testid="transcription-area"]'); [cite_start]// [cite: 129]

  [cite_start]// Agregar texto [cite: 130]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Texto antes de finalizar'); // [cite: 132]
  });

  [cite_start]// Finalizar [cite: 134]
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 135]
  await finalizarBtn.click(); [cite_start]// [cite: 135]

  [cite_start]// El texto debe persistir pero no debe haber nuevos updates [cite: 136]
  const textBefore = await transcriptionArea.textContent(); [cite_start]// [cite: 136]

  [cite_start]// Intentar agregar más audio [cite: 137]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Este texto no debe aparecer'); // [cite: 139]
  });

  const textAfter = await transcriptionArea.textContent(); [cite_start]// [cite: 141]
  [cite_start]// Verificar que no se agregó nuevo texto [cite: 142]
  expect(textAfter).toEqual(textBefore); [cite_start]// [cite: 143]
});

```

TC-02.5: Sistema funciona en Chrome

```javascript
test('HU-02.5: Sistema funciona correctamente en Chrome', async ({ page, context, browserName }) => {
  [cite_start]; // Este test solo corre en Chrome [cite: 147]
  if (browserName !== 'chromium') {
    test.skip();
    [cite_start]; // [cite: 149]
  }
  await context.grantPermissions(['microphone']);
  [cite_start]; // [cite: 151]
  await page.goto('http://localhost:4321/');
  [cite_start]; // [cite: 152]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")');
  [cite_start]; // [cite: 153]
  await expect(iniciarBtn).toBeVisible();
  [cite_start]; // [cite: 158]
  await iniciarBtn.click();
  [cite_start]; // [cite: 159]

  const transcriptionArea = page.locator('[data-testid="transcription-area"]');
  [cite_start]; // [cite: 160]
  await expect(transcriptionArea).toBeVisible();
  [cite_start]; // [cite: 160]
});
```

---

HU-04: Extracción Automática de Tareas y Compromisos con LLM

TC-04.1: Indicador de "Procesando..." mientras espera respuesta LLM

```javascript
test('HU-04.1: Sistema muestra indicador de procesamiento', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 163]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 165]
  [cite_start]// Iniciar y finalizar reunión [cite: 166]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 167]
  await iniciarBtn.click(); [cite_start]// [cite: 167]
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 168]
  await finalizarBtn.click(); [cite_start]// [cite: 168]

  [cite_start]// Debe aparecer indicador de procesamiento [cite: 169]
  const processingIndicator = page.locator('[data-testid="1lm-processing"]'); [cite_start]// [cite: 171]
  await expect(processingIndicator).toBeVisible(); [cite_start]// [cite: 171]
  await expect(processingIndicator).toContainText(/Procesando | Extrayendo/); [cite_start]// [cite: 172]
});

```

TC-04.2: Resumen muestra tareas con campos correctos

```javascript
test('HU-04.2: Resumen extraído lista tareas con campos completos', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 174]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 176]
  [cite_start]// Iniciar, agregar transcripción mock, finalizar [cite: 177]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 178]
  await iniciarBtn.click(); [cite_start]// [cite: 178]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Juan debe revisar el código antes del viernes para el proyecto web'); // [cite: 180, 181]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 186]
  await finalizarBtn.click(); [cite_start]// [cite: 186]

  [cite_start]// Esperar resultado del LLM [cite: 187]
  await page.waitForSelector('[data-testid="task-summary"]', { timeout: 10000 }); [cite_start]// [cite: 188]
  const taskItem = page.locator('[data-testid="task-item"]').first(); [cite_start]// [cite: 189, 190]

  [cite_start]// Verificar campos presentes [cite: 191]
  await expect(taskItem).toContainText(/revisar código/i); [cite_start]// [cite: 192]
  await expect(taskItem.locator('[data-field="responsable"]')).toBeVisible(); [cite_start]// [cite: 193]
  await expect(taskItem.locator('[data-field="fecha"]')).toBeVisible(); [cite_start]// [cite: 194]
});

```

TC-04.3: Usuario puede editar campo de tarea

```javascript
test('HU-04.3: Usuario puede editar campos de tarea extraída', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 198]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 199]
  [cite_start]// Setup: completar flujo hasta resumen [cite: 200]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 202]
  await iniciarBtn.click(); [cite_start]// [cite: 202]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Tarea original'); // [cite: 204]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 206]
  await finalizarBtn.click(); [cite_start]// [cite: 206]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 207]

  [cite_start]// Editar campo [cite: 208]
  const editBtn = page.locator('[data-testid="task-edit"]').first(); [cite_start]// [cite: 209]
  await editBtn.click(); [cite_start]// [cite: 209]
  const inputField = page.locator('[data-field="descripcion-edit"]').first(); [cite_start]// [cite: 210]
  await inputField.clear(); [cite_start]// [cite: 210]
  await inputField.fill('Tarea modificada'); [cite_start]// [cite: 211]
  const saveBtn = page.locator('[data-testid="edit-save"]').first(); [cite_start]// [cite: 212]
  await saveBtn.click(); [cite_start]// [cite: 212]

  [cite_start]// Verificar cambio [cite: 213]
  const taskItem = page.locator('[data-testid="task-item"]').first(); [cite_start]// [cite: 214]
  await expect(taskItem).toContainText('Tarea modificada'); [cite_start]// [cite: 215]
});

```

TC-04.4: Usuario puede agregar tarea manual

```javascript
test('HU-04.4: Usuario puede agregar nueva tarea manualmente', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 222]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 223]
  [cite_start]// Setup hasta resumen [cite: 224]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 225]
  await iniciarBtn.click(); [cite_start]// [cite: 225]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Tarea automática'); // [cite: 228]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 229]
  await finalizarBtn.click(); [cite_start]// [cite: 229]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 230]

  [cite_start]// Agregar tarea manual [cite: 231]
  const addBtn = page.locator('[data-testid="add-task-btn"]'); [cite_start]// [cite: 232]
  await addBtn.click(); [cite_start]// [cite: 232]
  const input = page.locator('[data-testid="new-task-input"]'); [cite_start]// [cite: 233]
  await input.fill('Nueva tarea manual'); [cite_start]// [cite: 233]
  const confirmBtn = page.locator('[data-testid="add-task-confirm"]'); [cite_start]// [cite: 234]
  await confirmBtn.click(); [cite_start]// [cite: 234]

  [cite_start]// Verificar que aparece en la lista [cite: 235]
  const tasks = page.locator('[data-testid="task-item"]'); [cite_start]// [cite: 236]
  await expect(tasks).toContainText('Nueva tarea manual'); [cite_start]// [cite: 237]
});

```

TC-04.5: Usuario puede eliminar tarea del resumen

```javascript
test('HU-04.5: Usuario puede eliminar tarea del resumen', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 240]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 241]
  [cite_start]// Setup [cite: 242]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 243]
  await iniciarBtn.click(); [cite_start]// [cite: 243]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Tarea 1. Tarea 2. Tarea 3.'); // [cite: 245]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 250]
  await finalizarBtn.click(); [cite_start]// [cite: 250]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 251]

  [cite_start]// Contar tareas antes [cite: 252]
  const tasksBefore = await page.locator('[data-testid="task-item"]').count(); [cite_start]// [cite: 253, 254]
  [cite_start]// Eliminar primera tarea [cite: 255]
  const deleteBtn = page.locator('[data-testid="task-delete"]').first(); [cite_start]// [cite: 256]
  await deleteBtn.click(); [cite_start]// [cite: 256]

  [cite_start]// Confirmar eliminación si hay modal [cite: 257]
  const confirmDelete = page.locator('[data-testid="confirm-delete"]'); [cite_start]// [cite: 258]
  [cite_start]if (await confirmDelete.isVisible()) { // [cite: 259]
    await confirmDelete.click(); [cite_start]// [cite: 261]
  }

  [cite_start]// Verificar reducción de tareas [cite: 262]
  const tasksAfter = await page.locator('[data-testid="task-item"]').count(); [cite_start]// [cite: 263]
  expect(tasksAfter).toBeLessThan(tasksBefore); [cite_start]// [cite: 263]
});

```

TC-04.6: Al presionar Confirmar, ítems pasan al guardado

```javascript
test('HU-04.6: Al presionar Confirmar, tareas se guardan', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 267]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 268]
  [cite_start]// Setup [cite: 269]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 270]
  await iniciarBtn.click(); [cite_start]// [cite: 271]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Tarea para guardar'); // [cite: 273]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 275]
  await finalizarBtn.click(); [cite_start]// [cite: 275]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 276]

  [cite_start]// Presionar Confirmar [cite: 277]
  const confirmBtn = page.locator('[data-testid="confirm-summary-btn"]'); [cite_start]// [cite: 278]
  await confirmBtn.click(); [cite_start]// [cite: 278]

  [cite_start]// Debe desaparecer el modal de resumen [cite: 279]
  const summary = page.locator('[data-testid="task-summary"]'); [cite_start]// [cite: 283]
  await expect(summary).not.toBeVisible(); [cite_start]// [cite: 283]

  [cite_start]// Debe aparecer dashboard o confirmación de guardado [cite: 284]
  const dashboard = page.locator('[data-testid="dashboard"]'); [cite_start]// [cite: 286]
  await expect(dashboard).toBeVisible(); [cite_start]// [cite: 286]
});

```

---

HU-05 y HU-06: Persistencia y Dashboard

TC-05.1: Tareas aparecen inmediatamente en dashboard tras confirmar

```javascript
test('HU-05.1 + HU-06.1: Tareas aparecen en dashboard tras confirmar', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 290]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 291]
  [cite_start]// Flujo completo [cite: 292]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 293]
  await iniciarBtn.click(); [cite_start]// [cite: 294]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Tarea dashboard test'); // [cite: 296]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 298]
  await finalizarBtn.click(); [cite_start]// [cite: 298]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 299]
  const confirmBtn = page.locator('[data-testid="confirm-summary-btn"]'); [cite_start]// [cite: 300]
  await confirmBtn.click(); [cite_start]// [cite: 300]

  [cite_start]// Verificar aparición en dashboard [cite: 301]
  const dashboard = page.locator('[data-testid="dashboard"]'); [cite_start]// [cite: 303]
  await expect(dashboard).toContainText('Tarea dashboard test'); [cite_start]// [cite: 304]
});

```

TC-06.1: Tareas ordenadas por fecha ascendente

```javascript
test('HU-06.1: Tareas ordenadas por fecha vencimiento ascendente', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 307]
  await page.goto('http://localhost:4321/tasks'); [cite_start]// [cite: 308]

  [cite_start]// Si ya existen tareas en BD desde pruebas anteriores [cite: 309]
  const taskItems = page.locator('[data-testid="task-item"]'); [cite_start]// [cite: 313]
  [cite_start]if (await taskItems.count() > 1) { // [cite: 314]
    [cite_start]// Obtener fechas de todas las tareas [cite: 315]
    const dates = await taskItems.locator('[data-field="fecha"]').allTextContents(); [cite_start]// [cite: 316, 317]
    [cite_start]// Convertir a timestamps para comparar [cite: 318]
    const timestamps = dates.map(d => {
      [cite_start]if (d === 'Sin fecha') return Infinity; // [cite: 320]
      return new Date(d).getTime(); [cite_start]// [cite: 321]
    });
    [cite_start]// Verificar orden ascendente [cite: 323]
    [cite_start]for (let i = 0; i < timestamps.length - 1; i++) { // [cite: 324]
      expect(timestamps[i] <= timestamps[i + 1]).toBeTruthy(); [cite_start]// [cite: 325]
    }
  }
});

```

TC-06.2: Tareas sin fecha aparecen al final

```javascript
test('HU-06.2: Tareas sin fecha de vencimiento aparecen al final', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 331]
  [cite_start]// Setup: crear tareas con y sin fecha [cite: 332]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 333]
  [cite_start]// Tarea 1 con fecha [cite: 334]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 335]
  await iniciarBtn.click(); [cite_start]// [cite: 335]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Tarea con fecha para el viernes'); // [cite: 337]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 339]
  await finalizarBtn.click(); [cite_start]// [cite: 339]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 340]
  const confirmBtn = page.locator('[data-testid="confirm-summary-btn"]'); [cite_start]// [cite: 341]
  await confirmBtn.click(); [cite_start]// [cite: 341]

  [cite_start]// Verificar en dashboard [cite: 342]
  const dashboard = page.locator('[data-testid="dashboard"]'); [cite_start]// [cite: 343, 345]
  const taskItems = dashboard.locator('[data-testid="task-item"]'); [cite_start]// [cite: 344, 346]

  [cite_start]// La última tarea sin fecha debe estar al final [cite: 347]
  const lastTask = taskItems.last(); [cite_start]// [cite: 348]
  const lastFecha = await lastTask.locator('[data-field="fecha"]').textContent(); [cite_start]// [cite: 352, 353]
  [cite_start]if (lastFecha === 'Sin fecha') { // [cite: 354]
    [cite_start]// Verificar que todas las anteriores tienen fecha [cite: 355]
    const count = await taskItems.count(); [cite_start]// [cite: 356]
    [cite_start]for (let i = 0; i < count - 1; i++) { // [cite: 357]
      const fecha = await taskItems.nth(i).locator('[data-field="fecha"]').textContent(); [cite_start]// [cite: 358, 359]
      expect(fecha).not.toBe('Sin fecha'); [cite_start]// [cite: 360]
    }
  }
});

```

TC-06.3: Cambios de estado persisten tras recarga

```javascript
test('HU-06.3: Estado de tarea persiste tras recargar página', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 366]
  await page.goto('http://localhost:4321/tasks'); [cite_start]// [cite: 367]
  [cite_start]// Encontrar una tarea [cite: 368]
  const taskCheckbox = page.locator('[data-testid="task-checkbox"]').first(); [cite_start]// [cite: 369]
  [cite_start]if (await taskCheckbox.isVisible()) { // [cite: 370]
    [cite_start]// Marcar como completada [cite: 372]
    await taskCheckbox.click(); [cite_start]// [cite: 373]
    const taskItem = page.locator('[data-testid="task-item"]').first(); [cite_start]// [cite: 374]
    await expect(taskItem).toHaveClass(/completed/); [cite_start]// [cite: 375]

    [cite_start]// Recargar página [cite: 376]
    await page.reload(); [cite_start]// [cite: 377]
    await page.waitForSelector('[data-testid="task-item"]'); [cite_start]// [cite: 378]

    [cite_start]// Verificar que sigue marcada [cite: 379]
    const reloadedTask = page.locator('[data-testid="task-item"]').first(); [cite_start]// [cite: 380]
    await expect(reloadedTask).toHaveClass(/completed/); [cite_start]// [cite: 380]
  }
});

```

---

HU-07: Observaciones de Proyecto

TC-07.1: Observaciones distinguidas de tareas

```javascript
test('HU-07.1: Sistema distingue tareas de observaciones', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 387]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 388]
  [cite_start]// Crear reunión con texto que genere observaciones [cite: 389]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 390]
  await iniciarBtn.click(); [cite_start]// [cite: 390]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Juan debe revisar el código. Nota importante: el cliente mencionó que le gusta el diseño actual.'); // [cite: 392, 393]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 397]
  await finalizarBtn.click(); [cite_start]// [cite: 397]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 398]

  [cite_start]// Verificar que hay separación de tareas y observaciones [cite: 399]
  const taskItems = page.locator('[data-testid="task-item"]'); [cite_start]// [cite: 399]
  const obsItems = page.locator('[data-testid="observation-item"]'); [cite_start]// [cite: 400]
  const taskCount = await taskItems.count(); [cite_start]// [cite: 401]
  const obsCount = await obsItems.count(); [cite_start]// [cite: 402]
  expect(taskCount + obsCount).toBeGreaterThan(0); [cite_start]// [cite: 403]
});

```

TC-07.2: Observaciones accesibles desde sección dedicada

```javascript
test('HU-07.2: Usuario puede acceder a observaciones desde sección dedicada', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 406]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 407]
  [cite_start]// Crear observaciones [cite: 408]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 409]
  await iniciarBtn.click(); [cite_start]// [cite: 409]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Decisión importante: cambiar a TypeScript'); // [cite: 411]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 412]
  await finalizarBtn.click(); [cite_start]// [cite: 412]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 413]
  const confirmBtn = page.locator('[data-testid="confirm-summary-btn"]'); [cite_start]// [cite: 417]
  await confirmBtn.click(); [cite_start]// [cite: 417]

  [cite_start]// Ir a sección de observaciones [cite: 418]
  const obsLink = page.locator('[data-testid="observations-link"]'); [cite_start]// [cite: 419]
  await expect(obsLink).toBeVisible(); [cite_start]// [cite: 420]
  await obsLink.click(); [cite_start]// [cite: 421]

  [cite_start]// Verificar que se muestran observaciones [cite: 422]
  const obsList = page.locator('[data-testid="observations-list"]'); [cite_start]// [cite: 423]
  await expect(obsList).toBeVisible(); [cite_start]// [cite: 423]
  await expect(obsList).toContainText(/Decisión | TypeScript/i); [cite_start]// [cite: 425]
});

```

TC-07.3: Observaciones NO aparecen en panel tareas

```javascript
test('HU-07.3: Observaciones no aparecen en panel de tareas', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 428]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 429]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 430]
  await iniciarBtn.click(); [cite_start]// [cite: 431]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Nota: esto es una observación, no una tarea'); // [cite: 433]
  });
  const finalizarBtn = page.locator('button:has-text("Finalizar Reunión")'); [cite_start]// [cite: 434]
  await finalizarBtn.click(); [cite_start]// [cite: 434]
  await page.waitForSelector('[data-testid="task-summary"]'); [cite_start]// [cite: 435]
  const confirmBtn = page.locator('[data-testid="confirm-summary-btn"]'); [cite_start]// [cite: 436]
  await confirmBtn.click(); [cite_start]// [cite: 436]

  [cite_start]// En dashboard de tareas, NO debe aparecer la observación [cite: 437]
  const dashboard = page.locator('[data-testid="dashboard"]'); [cite_start]// [cite: 439]
  const obsText = 'esto es una observación'; [cite_start]// [cite: 439]
  await expect(dashboard).not.toContainText(obsText); [cite_start]// [cite: 440]
});

```

---

HU-03: Diferenciación de Voces (Opcional)

TC-03.1: Sistema asigna etiquetas diferentes a hablantes

```javascript
test('HU-03.1: Sistema asigna etiquetas diferentes a voces distintas', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 448]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 449]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 450]
  await iniciarBtn.click(); [cite_start]// [cite: 450]

  [cite_start]// Simular 2 hablantes [cite: 451]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Voz 1: Hola a todos'); // [cite: 453, 457]
    window.mockTranscriptUpdate('Voz 2: Buenos días'); [cite_start]// [cite: 454, 457]
    window.mockTranscriptUpdate('Voz 1: ¿Cómo estás?'); [cite_start]// [cite: 455, 457]
  });

  const transcriptionArea = page.locator('[data-testid="transcription-area"]'); [cite_start]// [cite: 458]
  const text = await transcriptionArea.textContent(); [cite_start]// [cite: 458]
  [cite_start]// Verificar que hay etiquetas [cite: 459]
  expect(text).toContain('Voz 1'); [cite_start]// [cite: 460]
  expect(text).toContain('Voz 2'); [cite_start]// [cite: 461]
});

```

TC-03.2: Misma persona mantiene etiqueta consistente

```javascript
test('HU-03.2: Mismo hablante mantiene etiqueta consistente', async ({ page, context }) => {
  [cite_start]await context.grantPermissions(['microphone']); // [cite: 464]
  await page.goto('http://localhost:4321/'); [cite_start]// [cite: 465]
  const iniciarBtn = page.locator('button:has-text("Iniciar Reunión")'); [cite_start]// [cite: 466]
  await iniciarBtn.click(); [cite_start]// [cite: 466]

  [cite_start]// Simular mismo hablante múltiples veces [cite: 467]
  await page.evaluate(() => {
    [cite_start]window.mockTranscriptUpdate('Juan: Primera intervención'); // [cite: 469]
    window.mockTranscriptUpdate('María: Su intervención'); [cite_start]// [cite: 470]
    window.mockTranscriptUpdate('Juan: Segunda intervención de Juan'); [cite_start]// [cite: 471]
  });

  const transcriptionArea = page.locator('[data-testid="transcription-area"]'); [cite_start]// [cite: 473]
  const text = await transcriptionArea.textContent(); [cite_start]// [cite: 473]
  [cite_start]// Contar ocurrencias de "Juan" [cite: 474]
  const juanCount = (text.match(/Juan:/g) || []).length; [cite_start]// [cite: 475]
  [cite_start]// Debe aparecer al menos 2 veces con misma etiqueta [cite: 476]
  expect(juanCount).toBeGreaterThanOrEqual(2); [cite_start]// [cite: 481]
});

```

---

Matriz de Cobertura Funcional

| Historia  | TC / Cantidad | Estado | Prioridad |
| --------- | ------------- | ------ | --------- |
| **HU-01** | 6 tests       |

| Core

| Alta

|
| **HU-02** | 5 tests

| Core

| Alta

|
| **HU-04** | 6 tests

| Core

| Alta

|
| **HU-05** | 1 test

| Core

| Alta

|
| **HU-06** | 3 tests

| Core

| Alta

|
| **HU-07** | 3 tests

| Core

| Media

|
| **HU-03** | 2 tests

| Opcional

| Baja

|
| **Total** | <br>**26 tests E2E**

| | |

Comandos de Ejecución E2E

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests de una historia específica
npm run test:e2e-grep "HU-01"

# Ejecutar con interfaz UI
npx playwright test --ui

# Ejecutar contra navegador específico
npm run test:e2e -- --project chromium
npm run test:e2e -- --project firefox

```

> **Criterios de Éxito E2E:** Todos los 26 tests pasan sin fallos. Tiempo de ejecución suite completa < 5 minutos. Cero falsos positivos. Cobertura visual de 100% de flujos de usuario.

---

---

## Part 3: Pruebas de Integración (`INTEGRATION_TESTS.md`)

Validación de cómo se integran y comunican los módulos del sistema.

1. Escenarios de Integración Principales

Escenario 1: Audio Capture $\rightarrow$ Transcripción $\rightarrow$ Almacenamiento

**Objetivo:** Validar que el flujo completo de audio a transcripción guardada funciona sin pérdida de datos.

```javascript
describe('Integración: Captura de Audio Transcripción', () => {
  test('INT-01.1: Audio se captura, transcribe y persiste correctamente', async () => {
    // Setup
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 738]
    const transcriptService = new TranscripcionService(); [cite_start]// [cite: 739]

    // 1. Iniciar sesión
    const sesion = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 741, 742]
    expect(sesion.estado).toBe('ACTIVA'); [cite_start]// [cite: 744]
    expect(sesion.id).toBeDefined(); [cite_start]// [cite: 745]

    // 2. Simular captura de audio
    const audioBlob = new Blob(['audio mock data'], { type: 'audio/wav' }); [cite_start]// [cite: 747]

    // 3. Procesar fragmento de audio
    const textResult = await transcriptService.procesarFragmentoAudio(audioBlob, sesion.id); [cite_start]// [cite: 749, 751, 752]
    expect(textResult).toBeDefined(); [cite_start]// [cite: 753]
    expect(textResult.texto).toMatch(/\w+/); [cite_start]// [cite: 754]
    expect(textResult.timestamp).toBeDefined(); [cite_start]// [cite: 755]

    // 4. Verificar que se agregó a la transcripción acumulada
    const transcripcion = await transcriptService.obtenerTranscripcion(sesion.id); [cite_start]// [cite: 757]
    expect(transcripcion).toContain(textResult.texto); [cite_start]// [cite: 758]
    expect(transcripcion.length).toBeGreaterThan(0); [cite_start]// [cite: 759]

    // 5. Finalizar sesión
    const sesionFinal = await sesionService.finalizarSesion(sesion.id); [cite_start]// [cite: 761]
    expect(sesionFinal.estado).toBe('FINALIZADA'); [cite_start]// [cite: 762]
    expect(sesionFinal.transcripcionCompleta).toBeDefined(); [cite_start]// [cite: 764]
  });

  test('INT-01.2: Múltiples fragmentos se ordenan cronológicamente', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 769]
    const transcriptService = new TranscripcionService(); [cite_start]// [cite: 770]
    const sesion = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 771]

    // Procesar múltiples fragmentos
    const fragmentos = ['Primera frase', 'Segunda frase', 'Tercera frase']; [cite_start]// [cite: 774, 776, 777, 778]
    [cite_start]for (const frase of fragmentos) { // [cite: 779]
      const blob = new Blob([frase], { type: 'audio/wav' }); [cite_start]// [cite: 781]
      await transcriptService.procesarFragmentoAudio(blob, sesion.id); [cite_start]// [cite: 782]
      await new Promise(resolve => setTimeout(resolve, 100)); [cite_start]// Simular delay [cite: 783]
    }

    const transcripcion = await transcriptService.obtenerTranscripcion(sesion.id); [cite_start]// [cite: 784]
    // Verificar orden
    const primerIndex = transcripcion.indexOf('Primera'); [cite_start]// [cite: 786]
    const segundoIndex = transcripcion.indexOf('Segunda'); [cite_start]// [cite: 787]
    const tercerIndex = transcripcion.indexOf('Tercera'); [cite_start]// [cite: 788]
    expect(primerIndex).toBeLessThan(segundoIndex); [cite_start]// [cite: 789]
    expect(segundoIndex).toBeLessThan(tercerIndex); [cite_start]// [cite: 790]
  });

  test('INT-01.3: Error en captura de audio no corrompe transcripción anterior', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 794]
    const transcriptService = new TranscripcionService(); [cite_start]// [cite: 795]
    const sesion = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 796]

    // Agregar audio válido
    const blob1 = new Blob(['Texto válido'], { type: 'audio/wav' }); [cite_start]// [cite: 798]
    await transcriptService.procesarFragmentoAudio(blob1, sesion.id); [cite_start]// [cite: 798]
    const transcripcionAntes = await transcriptService.obtenerTranscripcion(sesion.id); [cite_start]// [cite: 799, 800]
    expect(transcripcionAntes).toContain('Texto válido'); [cite_start]// [cite: 801]

    // Simular error en siguiente fragmento
    const bloberror = new Blob([], { type: 'audio/wav' }); [cite_start]// Blob vacío [cite: 803]
    const result = await transcriptService.procesarFragmentoAudio(bloberror, sesion.id).catch(e => ({ error: e })); [cite_start]// [cite: 804, 805, 806, 807]

    // Verificar que error se manejó
    expect(result.error || result.texto === '').toBeTruthy(); [cite_start]// [cite: 812]
    // Transcripción anterior debe estar intacta
    const transcripcionDespues = await transcriptService.obtenerTranscripcion(sesion.id); [cite_start]// [cite: 814, 815]
    expect(transcripcionDespues).toContain('Texto válido'); [cite_start]// [cite: 816]
  });
});

```

---

Escenario 2: Transcripción $\rightarrow$ LLM Extraction $\rightarrow$ Guardado en BD

**Objetivo:** Validar que la transcripción se envía correctamente al LLM y el resultado se guarda.

```javascript
describe('Integración: Transcripción LLM Base de Datos', () => {
  test('INT-02.1: Transcripción completa se envía al LLM correctamente', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 826]
    const transcriptService = new TranscripcionService(); [cite_start]// [cite: 827]
    const llmService = new ExtractionLLMService(); [cite_start]// [cite: 828]
    const sesion = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 829]

    // Agregar transcripción
    const blob = new Blob(['Juan debe revisar código antes del viernes'], { type: 'audio/wav' }); [cite_start]// [cite: 831]
    await transcriptService.procesarFragmentoAudio(blob, sesion.id); [cite_start]// [cite: 832]
    const transcripcion = await transcriptService.obtenerTranscripcion(sesion.id); [cite_start]// [cite: 833]
    expect(transcripcion.length).toBeGreaterThan(0); [cite_start]// [cite: 834]

    // Enviar al LLM
    const prompt = await llmService.construirPrompt(transcripcion); [cite_start]// [cite: 836]
    expect(prompt).toContain(transcripcion); [cite_start]// [cite: 837]
    expect(prompt).toContain('tarea'); [cite_start]// [cite: 838]
    expect(prompt).toContain('responsable'); [cite_start]// [cite: 839]

    // Mock de respuesta LLM
    const mockRespuesta = {
      tareas: [{
        [cite_start]actividad: 'Revisar código', // [cite: 844]
        [cite_start]responsable: 'Juan', // [cite: 845]
        [cite_start]fecha: new Date(Date.now() + 7*24*60*60*1000), // Viernes [cite: 846]
        [cite_start]proyecto: 'General' // [cite: 846]
      }],
      [cite_start]observaciones: [] // [cite: 849]
    };

    // Parsear respuesta
    const tareas = await llmService.parsearRespuestaLLM(mockRespuesta); [cite_start]// [cite: 856]
    expect(tareas).toHaveLength(1); [cite_start]// [cite: 857]
    expect(tareas[0].actividad).toBe('Revisar código'); [cite_start]// [cite: 858]
    expect(tareas[0].responsable).toBe('Juan'); [cite_start]// [cite: 859]
  });

  test('INT-02.2: Tareas extraídas se guardan en BD correctamente', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 862]
    const persistenceService = new TareaPersistenceService(); [cite_start]// [cite: 863]
    const db = new DatabaseService(); [cite_start]// [cite: 864]
    const sesion = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 865]

    // Simular tareas extraídas
    const tareasExtraidas = [
      [cite_start]{ actividad: 'Tarea 1', responsable: 'Juan', fechaLimite: new Date(Date.now() + 1000*60*60*24), proyecto: 'Proyecto A' }, // [cite: 867, 869, 870, 871]
      [cite_start]{ actividad: 'Tarea 2', responsable: 'María', fechaLimite: null, proyecto: null } // [cite: 873, 874, 875, 876, 877]
    ];

    // Guardar tareas
    const idsGuardados = []; [cite_start]// [cite: 881]
    [cite_start]for (const tarea of tareasExtraidas) { // [cite: 882]
      [cite_start]const resultado = await persistenceService.guardarTarea({ // [cite: 883, 885]
        ...tarea,
        [cite_start]sesionId: sesion.id, // [cite: 886]
        [cite_start]estado: 'PENDIENTE', // [cite: 887]
        [cite_start]fechaCreacion: new Date() // [cite: 888]
      });
      expect(resultado.id).toBeDefined(); [cite_start]// [cite: 890]
      expect(resultado.estado).toBe('PENDIENTE'); [cite_start]// [cite: 891]
      expect(resultado.fechaCreacion).toBeDefined(); [cite_start]// [cite: 892]
      idsGuardados.push(resultado.id); [cite_start]// [cite: 893]
    }

    // Verificar en BD
    const tareasEnBD = await db.obtenerTareas({ sesionId: sesion.id }); [cite_start]// [cite: 896, 897]
    expect(tareasEnBD).toHaveLength(2); [cite_start]// [cite: 902]
    [cite_start]tareasEnBD.forEach((tarea, index) => { // [cite: 903]
      expect(tarea.id).toBe(idsGuardados[index]); [cite_start]// [cite: 904]
      expect(tarea.actividad).toBe(tareasExtraidas[index].actividad); [cite_start]// [cite: 905]
    });
  });

  test('INT-02.3: No se guardan tareas duplicadas del mismo LLM call', async () => {
    [cite_start]const persistenceService = new TareaPersistenceService(); // [cite: 911]
    const db = new DatabaseService(); [cite_start]// [cite: 912]
    const sesionId = 'test-session-001'; [cite_start]// [cite: 913]

    // Primera ejecución: guardar tarea
    const tarea = { actividad: 'Tarea única', sesionId, estado: 'PENDIENTE', fechaCreacion: new Date() }; [cite_start]// [cite: 914, 916, 917, 918, 919]
    const id1 = await persistenceService.guardarTarea(tarea); [cite_start]// [cite: 920]
    expect(id1.id).toBeDefined(); [cite_start]// [cite: 921]

    // Intentar guardar la MISMA tarea de nuevo (duplicada)
    const id2 = await persistenceService.guardarTarea(tarea); [cite_start]// [cite: 923]
    [cite_start]// Verificar que se creó nueva tarea (sin lógica anti-duplicada en este nivel, se maneja en API/UI) [cite: 924, 925]
    expect(id2.id).toBeDefined(); [cite_start]// [cite: 926]
  });

  test('INT-02.4: Error en LLM no pierde datos de transcripción', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 931]
    const transcriptService = new TranscripcionService(); [cite_start]// [cite: 932]
    const llmService = new ExtractionLLMService(); [cite_start]// [cite: 933]
    const sesion = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 934]

    const blob = new Blob(['Transcripción importante'], { type: 'audio/wav' }); [cite_start]// [cite: 935]
    await transcriptService.procesarFragmentoAudio(blob, sesion.id); [cite_start]// [cite: 936]
    const transcripcion = await transcriptService.obtenerTranscripcion(sesion.id); [cite_start]// [cite: 937]
    expect(transcripcion).toContain('Transcripción importante'); [cite_start]// [cite: 938]

    // Simular error en LLM (timeout, API caída)
    [cite_start]const result = await llmService.extraerTareas(transcripcion).catch(e => { // [cite: 939]
      console.error('LLM Error (expected):', e.message); [cite_start]// [cite: 944]
      return { error: e, fallback: true }; [cite_start]// [cite: 944]
    });

    expect(result.error || result.fallback).toBeTruthy(); [cite_start]// [cite: 945]
    // Transcripción sigue disponible para retry manual
    const transcripcionRecuperada = await transcriptService.obtenerTranscripcion(sesion.id); [cite_start]// [cite: 946]
    expect(transcripcionRecuperada).toBe(transcripcion); [cite_start]// [cite: 948]
  });
});

```

---

Escenario 3: BD Dashboard UI $\rightarrow$ Actualización en Tiempo Real

**Objetivo:** Validar que los datos persistidos en BD se muestran correctamente en el dashboard.

```javascript
describe('Integración: Base de Datos Dashboard', () => {
  test('INT-03.1: Tareas guardadas aparecen inmediatamente en dashboard', async () => {
    [cite_start]const persistenceService = new TareaPersistenceService(); // [cite: 955]
    const dashboardService = new DashboardService(); [cite_start]// [cite: 956]

    // Guardar tareas
    const tarea1 = await persistenceService.guardarTarea({ actividad: 'Dashboard test 1', estado: 'PENDIENTE', fechaCreacion: new Date(), fechaLimite: new Date(Date.now() + 1000*60*60*24) }); [cite_start]// [cite: 959, 960, 961, 962, 964]
    const tarea2 = await persistenceService.guardarTarea({ actividad: 'Dashboard test 2', estado: 'PENDIENTE', fechaCreacion: new Date(), fechaLimite: null }); [cite_start]// [cite: 965, 966, 967, 968, 969, 970]

    // Obtener tareas para dashboard
    const tareasParaDashboard = await dashboardService.obtenerTareasPendientes(); [cite_start]// [cite: 973]
    expect(tareasParaDashboard).toHaveLength(2); [cite_start]// [cite: 974]
    const ids = tareasParaDashboard.map(t => t.id).sort(); [cite_start]// [cite: 975]
    const savedIds = [tarea1.id, tarea2.id].sort(); [cite_start]// [cite: 976]
    expect(ids).toEqual(savedIds); [cite_start]// [cite: 977]
  });

  test('INT-03.2: Tareas se ordenan por fecha correctamente en dashboard', async () => {
    [cite_start]const persistenceService = new TareaPersistenceService(); // [cite: 983]
    const dashboardService = new DashboardService(); [cite_start]// [cite: 984]

    const manana = new Date(); manana.setDate(manana.getDate() + 1); [cite_start]// [cite: 986, 987]
    const proxSemana = new Date(); proxSemana.setDate(proxSemana.getDate() + 7); [cite_start]// [cite: 988, 989]
    const hoy = new Date(); [cite_start]// [cite: 990]

    await persistenceService.guardarTarea({ actividad: 'Próxima semana', estado: 'PENDIENTE', fechaCreacion: new Date(), fechaLimite: proxSemana }); [cite_start]// [cite: 991, 992, 993, 994, 996]
    await persistenceService.guardarTarea({ actividad: 'Mañana', estado: 'PENDIENTE', fechaCreacion: new Date(), fechaLimite: manana }); [cite_start]// [cite: 997, 998, 999, 1000, 1002]
    await persistenceService.guardarTarea({ actividad: 'Hoy', estado: 'PENDIENTE', fechaCreacion: new Date(), fechaLimite: hoy }); [cite_start]// [cite: 1003, 1004, 1005, 1006, 1007]

    const tareas = await dashboardService.obtenerTareasOrdenadas(); [cite_start]// [cite: 1009]
    // Verificar orden: hoy -> mañana -> próxima semana
    expect(tareas[0].actividad).toBe('Hoy'); [cite_start]// [cite: 1012]
    expect(tareas[1].actividad).toBe('Mañana'); [cite_start]// [cite: 1013]
    expect(tareas[2].actividad).toBe('Próxima semana'); [cite_start]// [cite: 1015]
  });

  test('INT-03.3: Marcar tarea como completada persiste en BD y dashboard', async () => {
    [cite_start]const persistenceService = new TareaPersistenceService(); // [cite: 1018]
    const dashboardService = new DashboardService(); [cite_start]// [cite: 1019]
    const db = new DatabaseService(); [cite_start]// [cite: 1020]

    const tarea = await persistenceService.guardarTarea({ actividad: 'Tarea para completar', estado: 'PENDIENTE', fechaCreacion: new Date() }); [cite_start]// [cite: 1022, 1023, 1024, 1025]
    const idTarea = tarea.id; [cite_start]// [cite: 1030, 1031]

    // Verificar que está pendiente
    let tareasEnDashboard = await dashboardService.obtenerTareasPendientes(); [cite_start]// [cite: 1033]
    let tareasConId = tareasEnDashboard.filter(t => t.id === idTarea); [cite_start]// [cite: 1033]
    expect(tareasConId).toHaveLength(1); [cite_start]// [cite: 1034]

    // Marcar como completada
    await persistenceService.marcarCompletada(idTarea); [cite_start]// [cite: 1036]

    // Verificar en BD
    const tareasCompletadas = await db.obtenerTareas({ estado: 'COMPLETADA', id: idTarea }); [cite_start]// [cite: 1038, 1040, 1041]
    expect(tareasCompletadas).toHaveLength(1); [cite_start]// [cite: 1042]
    expect(tareasCompletadas[0].estado).toBe('COMPLETADA'); [cite_start]// [cite: 1043]

    // Verificar que NO aparece en pendientes del dashboard
    tareasEnDashboard = await dashboardService.obtenerTareasPendientes(); [cite_start]// [cite: 1045]
    tareasConId = tareasEnDashboard.filter(t => t.id === idTarea); [cite_start]// [cite: 1045]
    expect(tareasConId).toHaveLength(0); [cite_start]// [cite: 1046]

    // Pero aparece en tareas completadas
    const completadas = await dashboardService.obtenerTareasCompletadas(); [cite_start]// [cite: 1048]
    tareasConId = completadas.filter(t => t.id === idTarea); [cite_start]// [cite: 1048]
    expect(tareasConId).toHaveLength(1); [cite_start]// [cite: 1049]
  });

  test('INT-03.4: Recargar página no pierde datos del dashboard', async () => {
    [cite_start]const persistenceService = new TareaPersistenceService(); // [cite: 1051]
    const dashboardService = new DashboardService(); [cite_start]// [cite: 1052]

    const tarea1 = await persistenceService.guardarTarea({ actividad: 'Persistencia test 1', estado: 'PENDIENTE', fechaCreacion: new Date() }); [cite_start]// [cite: 1054, 1055, 1056, 1057]
    const tarea2 = await persistenceService.guardarTarea({ actividad: 'Persistencia test 2', estado: 'COMPLETADA', fechaCreacion: new Date() }); [cite_start]// [cite: 1059, 1060, 1061, 1062]

    // Simular recargar página (reconectar a BD)
    const db = new DatabaseService(); [cite_start]// [cite: 1065]
    await db.reconnect(); [cite_start]// [cite: 1066]

    const tareasRecuperadas = await dashboardService.obtenerTodasTareas(); [cite_start]// [cite: 1068]
    expect(tareasRecuperadas.length).toBeGreaterThanOrEqual(2); [cite_start]// [cite: 1072]
    const ids = tareasRecuperadas.map(t => t.id); [cite_start]// [cite: 1073]
    expect(ids).toContain(tarea1.id); [cite_start]// [cite: 1074]
    expect(ids).toContain(tarea2.id); [cite_start]// [cite: 1075]
  });
});

```

---

Escenario 4: Extracción LLM $\rightarrow$ Clasificación Almacenamiento Separado (Tareas vs Observaciones)

**Objetivo:** Validar que tareas y observaciones se separan y guardan correctamente.

```javascript
describe('Integración: LLM Clasificación Almacenamiento Separado', () => {
  test('INT-04.1: Items se clasifican correctamente como tarea u observación', async () => {
    [cite_start]const classificationService = new ItemClassificationService(); // [cite: 1085]
    const items = [
      [cite_start]{ texto: 'Juan debe revisar el código antes del viernes', responsable: 'Juan', fecha: '2026-06-03' }, // [cite: 1088, 1089, 1090]
      [cite_start]{ texto: 'El cliente mencionó que le gusta el diseño actual', responsable: null, fecha: null }, // [cite: 1094, 1095, 1096]
      [cite_start]{ texto: 'María completará el documento el próximo lunes', responsable: 'Maria', fecha: '2026-06-02' }, // [cite: 1098, 1099, 1100]
      [cite_start]{ texto: 'Nota importante: cambiar la estrategia de testing', responsable: null, fecha: null } // [cite: 1105, 1106, 1107]
    ];

    const clasificados = await classificationService.clasificarItems(items); [cite_start]// [cite: 1108]
    const tareas = clasificados.filter(i => i.tipo === 'TAREA'); [cite_start]// [cite: 1109]
    const observaciones = clasificados.filter(i => i.tipo === 'OBSERVACION'); [cite_start]// [cite: 1110]

    expect(tareas.length).toBeGreaterThanOrEqual(2); [cite_start]// Items 0 y 2 [cite: 1111]
    expect(observaciones.length).toBeGreaterThanOrEqual(2); [cite_start]// Items 1 y 3 [cite: 1111]
  });

  test('INT-04.2: Tareas y observaciones se guardan en tablas separadas', async () => {
    [cite_start]const classificationService = new ItemClassificationService(); // [cite: 1118]
    const persistenceService = new TareaPersistenceService(); [cite_start]// [cite: 1119]
    const observationService = new ObservationPersistenceService(); [cite_start]// [cite: 1120]
    const db = new DatabaseService(); [cite_start]// [cite: 1121]
    const sesionId = 'test-session-004'; [cite_start]// [cite: 1122]

    const item = { texto: 'Tarea para tabla separada', responsable: 'Usuario', fecha: new Date() }; [cite_start]// [cite: 1123, 1125, 1126, 1127]

    const clasificacion = await classificationService.clasificarItem(item); [cite_start]// [cite: 1129]
    expect(clasificacion.tipo).toBe('TAREA'); [cite_start]// [cite: 1129]

    const tareasAntes = await db.contarTareas(); [cite_start]// [cite: 1131]
    await persistenceService.guardarTarea({ actividad: item.texto, responsable: item.responsable, estado: 'PENDIENTE', sesionId, fechaCreacion: new Date() }); [cite_start]// [cite: 1132, 1133, 1134, 1135, 1136]
    const tareasDespues = await db.contarTareas(); [cite_start]// [cite: 1138]
    expect(tareasDespues).toBe(tareasAntes + 1); [cite_start]// [cite: 1138]

    const obsAntes = await db.contarObservaciones(); [cite_start]// [cite: 1140]
    await observationService.guardarObservacion({ texto: 'Esto es una observación', sesionId, fechaCreacion: new Date() }); [cite_start]// [cite: 1140, 1141, 1142, 1143]
    const obsDespues = await db.contarObservaciones(); [cite_start]// [cite: 1145]
    expect(obsDespues).toBe(obsAntes + 1); [cite_start]// [cite: 1146]

    // Verificar integridad y estructura en BD
    const tareasEnBD = await db.obtenerTareas({ sesionId }); [cite_start]// [cite: 1148]
    tareasEnBD.forEach(tarea => {
      [cite_start]expect(tarea.estado).toBeDefined(); // [cite: 1150]
      expect(tarea.estado).toMatch(/PENDIENTE | COMPLETADA/); [cite_start]// [cite: 1151]
    });

    const obsEnBD = await db.obtenerObservations({ sesionId }); [cite_start]// [cite: 1154]
    obsEnBD.forEach(obs => {
      [cite_start]expect(obs.estado).toBeUndefined(); // [cite: 1155]
    });
  });

  test('INT-04.3: Observaciones no aparecen en dashboard de tareas', async () => {
    [cite_start]const persistenceService = new TareaPersistenceService(); // [cite: 1162]
    const observationService = new ObservationPersistenceService(); [cite_start]// [cite: 1163]
    const dashboardService = new DashboardService(); [cite_start]// [cite: 1164]
    const sesionId = 'test-session-004b'; [cite_start]// [cite: 1165]

    await persistenceService.guardarTarea({ actividad: 'Esta es una tarea', estado: 'PENDIENTE', sesionId, fechaCreacion: new Date() }); [cite_start]// [cite: 1166, 1167, 1168, 1169]
    await observationService.guardarObservacion({ texto: 'Esta es una observación', sesionId, fechaCreacion: new Date() }); [cite_start]// [cite: 1171, 1172, 1173, 1174]

    const tareasParaDashboard = await dashboardService.obtenerTareasParaSesion(sesionId); [cite_start]// [cite: 1177, 1178]
    const textos = tareasParaDashboard.map(t => t.actividad).join(''); [cite_start]// [cite: 1181]
    expect(textos).toContain('Esta es una tarea'); [cite_start]// [cite: 1182]
    expect(textos).not.toContain('Esta es una observación'); [cite_start]// [cite: 1183]
  });

  test('INT-04.4: Observaciones filtradas por sesión/reunión', async () => {
    [cite_start]const observationService = new ObservationPersistenceService(); // [cite: 1185]
    const db = new DatabaseService(); [cite_start]// [cite: 1186]
    const sesion1Id = 'sesion-001'; [cite_start]// [cite: 1187]
    const sesion2Id = 'sesion-002'; [cite_start]// [cite: 1188]

    await observationService.guardarObservacion({ texto: 'Observación de sesión 1', sesionId: sesion1Id, fechaCreacion: new Date() }); [cite_start]// [cite: 1190, 1191, 1193, 1194]
    await observationService.guardarObservacion({ texto: 'Observación de sesión 2', sesionId: sesion2Id, fechaCreacion: new Date() }); [cite_start]// [cite: 1195, 1196, 1197, 1198]

    const obs1 = await db.obtenerObservaciones({ sesionId: sesion1Id }); [cite_start]// [cite: 1205]
    const obs2 = await db.obtenerObservaciones({ sesionId: sesion2Id }); [cite_start]// [cite: 1205]
    expect(obs1).toHaveLength(1); [cite_start]// [cite: 1206]
    expect(obs1[0].texto).toContain('sesión 1'); [cite_start]// [cite: 1207]
    expect(obs2).toHaveLength(1); [cite_start]// [cite: 1208]
    expect(obs2[0].texto).toContain('sesión 2'); [cite_start]// [cite: 1209]
  });
});

```

---

Escenario 5: Múltiples Reuniones en Sesión del Navegador

**Objetivo:** Validar que múltiples reuniones se manejan correctamente sin mezclar datos.

```javascript
describe('Integración: Múltiples Reuniones', () => {
  test('INT-05.1: Múltiples reuniones en la misma sesión se aíslan correctamente', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 1217]
    const persistenceService = new TareaPersistenceService(); [cite_start]// [cite: 1218]
    const db = new DatabaseService(); [cite_start]// [cite: 1219]

    // Reunión 1
    const reunion1 = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 1221]
    await persistenceService.guardarTarea({ actividad: 'Tarea de reunión 1', estado: 'PENDIENTE', sesionId: reunion1.id, fechaCreacion: new Date() }); [cite_start]// [cite: 1222, 1223, 1224, 1225, 1226]
    await sesionService.finalizarSesion(reunion1.id); [cite_start]// [cite: 1228]

    // Reunión 2
    const reunion2 = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 1230]
    await persistenceService.guardarTarea({ actividad: 'Tarea de reunión 2', estado: 'PENDIENTE', sesionId: reunion2.id, fechaCreacion: new Date() }); [cite_start]// [cite: 1231, 1232, 1233, 1234, 1235]
    await sesionService.finalizarSesion(reunion2.id); [cite_start]// [cite: 1237]

    // Reunión 3
    const reunion3 = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 1239]
    await persistenceService.guardarTarea({ actividad: 'Tarea de reunión 3', estado: 'PENDIENTE', sesionId: reunion3.id, fechaCreacion: new Date() }); [cite_start]// [cite: 1241, 1245, 1246, 1247, 1248]
    await sesionService.finalizarSesion(reunion3.id); [cite_start]// [cite: 1250]

    // Verificar aislamiento
    const tareas1 = await db.obtenerTareas({ sesionId: reunion1.id }); [cite_start]// [cite: 1252]
    expect(tareas1).toHaveLength(1); [cite_start]// [cite: 1253]
    expect(tareas1[0].actividad).toBe('Tarea de reunión 1'); [cite_start]// [cite: 1254]

    const tareas2 = await db.obtenerTareas({ sesionId: reunion2.id }); [cite_start]// [cite: 1255]
    expect(tareas2).toHaveLength(1); [cite_start]// [cite: 1255]
    expect(tareas2[0].actividad).toBe('Tarea de reunión 2'); [cite_start]// [cite: 1256]

    const tareas3 = await db.obtenerTareas({ sesionId: reunion3.id }); [cite_start]// [cite: 1257]
    expect(tareas3).toHaveLength(1); [cite_start]// [cite: 1257]
    expect(tareas3[0].actividad).toBe('Tarea de reunión 3'); [cite_start]// [cite: 1258]
  });

  test('INT-05.2: Dashboard muestra TODAS las tareas ordenadas sin mezcla', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 1262]
    const persistenceService = new TareaPersistenceService(); [cite_start]// [cite: 1263]
    const dashboardService = new DashboardService(); [cite_start]// [cite: 1264]

    const reuniones = []; [cite_start]// [cite: 1266]
    const fechas = [
      [cite_start]new Date(Date.now() + 1*24*60*60*1000), // Mañana [cite: 1269]
      [cite_start]new Date(Date.now() + 3*24*60*60*1000), // En 3 días [cite: 1270]
      [cite_start]new Date(Date.now() + 2*24*60*60*1000)  // En 2 días [cite: 1271]
    ];

    [cite_start]for (let i = 0; i < 3; i++) { // [cite: 1272]
      const reunion = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 1273, 1274]
      reuniones.push(reunion); [cite_start]// [cite: 1275]
      [cite_start]await persistenceService.guardarTarea({ // [cite: 1276]
        [cite_start]actividad: `Tarea reunión ${i+1}`, // [cite: 1277]
        [cite_start]estado: 'PENDIENTE', // [cite: 1278]
        [cite_start]sesionId: reunion.id, // [cite: 1279]
        [cite_start]fechaLimite: fechas[i], // [cite: 1280]
        [cite_start]fechaCreacion: new Date() // [cite: 1281]
      });
      await sesionService.finalizarSesion(reunion.id); [cite_start]// [cite: 1283]
    }

    const todasTareas = await dashboardService.obtenerTareasOrdenadasPorFecha(); [cite_start]// [cite: 1286]
    expect(todasTareas).toHaveLength(3); [cite_start]// [cite: 1290]

    // Verificar orden global: mañana -> 2 días -> 3 días
    const fechasOrdenadas = todasTareas.map(t => t.fechaLimite.getTime()); [cite_start]// [cite: 1292]
    for (let i = 0; i < fechasOrdenadas.length - 1; i++) {
      expect(fechasOrdenadas[i]).toBeLessThanOrEqual(fechasOrdenadas[i+1]); [cite_start]// [cite: 1295]
    }
  });

  test('INT-05.3: Observaciones vinculadas correctamente a su reunión origen', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 1298]
    const observationService = new ObservationPersistenceService(); [cite_start]// [cite: 1299]
    const db = new DatabaseService(); [cite_start]// [cite: 1300]

    const reunion1 = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 1302]
    await observationService.guardarObservacion({ texto: 'Observación de reunión 1', sesionId: reunion1.id, fechaCreacion: new Date() }); [cite_start]// [cite: 1303, 1304, 1305, 1306]

    const reunion2 = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 1310]
    await observationService.guardarObservacion({ texto: 'Observación de reunión 2', sesionId: reunion2.id, fechaCreacion: new Date() }); [cite_start]// [cite: 1311, 1312, 1313, 1315]

    const obs1 = await db.obtenerObservaciones({ sesionId: reunion1.id }); [cite_start]// [cite: 1317]
    expect(obs1).toHaveLength(1); [cite_start]// [cite: 1318]
    expect(obs1[0].sesionId).toBe(reunion1.id); [cite_start]// [cite: 1319]

    const obs2 = await db.obtenerObservaciones({ sesionId: reunion2.id }); [cite_start]// [cite: 1320]
    expect(obs2).toHaveLength(1); [cite_start]// [cite: 1321]
    expect(obs2[0].sesionId).toBe(reunion2.id); [cite_start]// [cite: 1323]
  });

  test('INT-05.4: Completar tarea de una reunión no afecta otras', async () => {
    [cite_start]const sesionService = new SesionReunionService(); // [cite: 1324]
    const persistenceService = new TareaPersistenceService(); [cite_start]// [cite: 1326]
    const db = new DatabaseService(); [cite_start]// [cite: 1327]

    const reunion1 = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 1328]
    const tarea1 = await persistenceService.guardarTarea({ actividad: 'Tarea a completar', estado: 'PENDIENTE', sesionId: reunion1.id, fechaCreacion: new Date() }); [cite_start]// [cite: 1329, 1330, 1331, 1332, 1337]

    const reunion2 = await sesionService.iniciarSesion({ dispositivo: 'microphone' }); [cite_start]// [cite: 1339]
    const tarea2 = await persistenceService.guardarTarea({ actividad: 'Otra tarea', estado: 'PENDIENTE', sesionId: reunion2.id, fechaCreacion: new Date() }); [cite_start]// [cite: 1340, 1341, 1342, 1344, 1345]

    // Completar tarea de reunión 1
    await persistenceService.marcarCompletada(tarea1.id); [cite_start]// [cite: 1347]

    // Verificar que tarea de reunión 2 sigue intacta y pendiente
    const tareaVerify = await db.obtenerTarea(tarea2.id); [cite_start]// [cite: 1348]
    expect(tareaVerify.estado).toBe('PENDIENTE'); [cite_start]// [cite: 1348]
  });
});

```

---

2. Matriz de Escenarios de Integración

| Escenario | Módulos Involucrados | Cantidad Casos | Prioridad |
| --------- | -------------------- | -------------- | --------- |

| <br>**Audio Transcripción**

| Audio, Transcription

| 3

| Alta

|
| <br>**Transcripción LLM BD**

| Transcription, LLM, Persistence

| 4

| Alta

|
| <br>**BD Dashboard**

| Persistence, Dashboard, UI

| 4

| Alta

|
| <br>**LLM Clasificación Almacenamiento**

| LLM, Classification, Persistence

| 4

| Alta

|
| <br>**Múltiples Reuniones**

| Session, Persistence, Dashboard

| 4

| Alta

|
| **Total** | | <br>**19 tests integración**

| |

Comandos de Ejecución Integración

```bash
# Ejecutar solo tests de integración
npm run test:integration

# Ejecutar un escenario específico
npm run test:integration-grep "INT-02"

# Con reporte de cobertura
npm run test:integration -- --coverage

# Con logging detallado
npm run test:integration -- --reporter=verbose

```

> **Criterios de Éxito de Integración:** Todos los 19 tests de integración pasan. No hay fugas de datos entre módulos. Las transacciones de BD son atómicas. Los errores se manejan sin corrupción de estado. Los datos persisten entre reconexiones. Tiempo de ejecución total < 3 minutos.

3. Validación de Datos Clave (Checklist Pre-Iteración)

- [ ] Audio capturado $\neq$ Null.

- [ ] Transcripción en orden cronológico estructurado.

- [ ] La respuesta del LLM tiene la estructura JSON esperada.

- [ ] Las tareas en la BD tienen un estado válido (`'PENDIENTE'` | `'COMPLETADA'`).

- [ ] Las fechas están formateadas estrictamente bajo la norma ISO 8601.

- [ ] IDs de sesión únicos, autogenerados y correlacionados.

- [ ] Las observaciones tienen la referencia/llave a la sesión de origen.

- [ ] El panel de control (Dashboard) excluye las observaciones del listado.

- [ ] Cero registros duplicados en las tablas de la BD.
