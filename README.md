# XP-Flow

**Gestión de proyectos bajo Programación Extrema (XP)**

XP-Flow es una aplicación web construida con [Astro](https://astro.build) que implementa las prácticas, valores y fases de la Programación Extrema (eXtreme Programming) en una interfaz moderna e interactiva. El equipo "XP Pioneers" (Christian Puchaicela, Jahir Rocha, Ariel Rosas, Kevin Palacios, Jhonathan Pulig, Santiago Pinta) construyó esta herramienta siguiendo las metodologías XP que ella misma gestiona.

---

## ✨ Funcionalidades

### Panel de Control (`/dashboard`)

- Resumen general del proyecto: velocidad del equipo, historias completadas, cobertura de parejas y tasa de TDD
- Seguimiento de la iteración activa con barra de progreso temporal
- Acceso rápido a las herramientas principales
- Visualización de deuda técnica pendiente

### Historias de Usuario (`/stories`)

- Crear, editar y visualizar historias de usuario estilo tarjeta de índice físico
- Volteo 3D de tarjetas para ver criterios de aceptación en el reverso
- Filtros por estado, riesgo y adopción de TDD
- Asignación de parejas de programación y estimación con escala Fibonacci (1, 2, 3, 5, 8, 13, 21)
- Valor de negocio (1–5 estrellas) y evaluación de riesgo (Bajo/Medio/Alto)

### Juego de Planeación (`/planning`)

- Tablero Kanban con columnas Backlog → En Curso → Terminado
- Arrastrar y soltar (drag & drop) usando `@dnd-kit`
- Encabezado de capacidad que se vuelve rojo si se excede
- Puntos acumulados por columna

### Iteraciones (`/iterations`)

- Línea de tiempo cronológica de iteraciones
- Gráfico de capacidad y puntos comprometidos vs. completados
- Detalle expandible por iteración con historias asignadas e indicador TDD

### Standup Diaria (`/standup`)

- Temporizador de 10 minutos para la reunión diaria
- Registro individual por miembro: ¿qué hice ayer?, ¿qué haré hoy?, ¿tengo impedimentos?
- Historial persistente en localStorage
- Avance automático al siguiente orador

### Programación en Pareja (`/pairs`)

- Temporizador de sesión con roles de Conductor y Navegador
- Botón para intercambiar roles durante la sesión
- Matriz de rotación de parejas con código de colores
- Recomendaciones automáticas de rotación para evitar silos de conocimiento
- Exportación de sesiones a Markdown
- Widget flotante visible desde cualquier página

### Pruebas y TDD (`/tests`)

- Panel de cumplimiento de TDD con medidor circular
- Lista de verificación de criterios de aceptación por historia
- Consola de pruebas simulada estilo Vitest
- Botón "Aceptar y Desplegar Historia" al cumplir todos los criterios
- Integración con el sistema de CI/CD

### Integración Continua (`/ci`)

- Pipeline CI visual con etapas: Lint → Pruebas (TDD) → Compilación → Despliegue
- Umbrales de calidad XP: tasa TDD mínima del 50%, deuda técnica de alta prioridad resuelta
- Historial de compilaciones con estado, duración y responsable
- Bloqueo de seguridad: si no se cumplen los umbrales, el pipeline se aborta

### Refactorización y Deuda Técnica (`/refactors`)

- Registro de deuda técnica y tareas de refactorización
- Medidor de salud del código
- Directiva automática de refactorización del Coach
- Asignación de prioridad (Baja/Media/Alta) basada en palabras clave

### Retrospectivas (`/retrospective`)

- Tablero de notas adhesivas con tres columnas: Salió Bien, Requiere Cambios, Acciones a Tomar
- Sistema de votación (👍) para priorizar temas
- Exportación a Markdown para commit al repositorio
- Persistencia en localStorage

### Salud XP (`/health`)

- Gráfico de velocidad por iteración
- Gráfico de burndown
- Medidores de cumplimiento de prácticas XP
- Seguimiento de refactorización

### Equipo y Ritmo Sostenible (`/team`)

- Directorio de miembros del equipo con roles XP
- Monitor de ritmo sostenible (40 horas/semana) con alertas de sobretiempo
- Asignación de avatar, rol y descripción
- Integración automática con horas de sesiones en pareja

### Configuración (`/settings`)

- Perfil de usuario (nombre, correo, rol)
- Preferencias de notificación por tipo de evento
- Cierre de sesión

---

## 🚀 Primeros Pasos — Tutorial Rápido

### 1. Inicio de sesión o registro

Abre la aplicación en `http://localhost:4321`. Verás la pantalla de inicio de sesión.

- **Registro**: Haz clic en _¿No tienes una cuenta? Regístrate_. Ingresa tu nombre, correo electrónico, selecciona tu rol XP (Programador, Cliente, Coach, Tester o Tracker) y elige una contraseña (mínimo 8 caracteres).
- **Inicio de sesión**: Ingresa tu correo y contraseña. Al autenticarte serás redirigido al panel de control.

### 2. Explorar el Panel de Control

El panel de control (`/dashboard`) te da una vista general del proyecto:

- **Velocidad**: Puntos promedio completados por iteración
- **Historias**: Conteo de historias terminadas vs. totales
- **Parejas**: Porcentaje de historias asignadas en pareja y horas totales de programación en pareja
- **TDD**: Porcentaje de historias que usan Desarrollo Guiado por Pruebas
- La iteración activa se muestra en la parte superior con una barra de progreso temporal

### 3. Crear tu primera Historia de Usuario

1. En la barra lateral, haz clic en **Historias**
2. Presiona el botón **Escribir Historia de Usuario** (esquina superior derecha)
3. Completa el formulario:
   - **Título**: Describe la funcionalidad deseada (ej. "Como cliente, quiero ver el catálogo de productos")
   - **Puntos**: Estima el esfuerzo usando la escala Fibonacci
   - **Valor de Negocio**: Prioriza del 1 al 5
   - **Riesgo**: Evalúa el nivel de incertidumbre
   - **Estado**: Elige Backlog (por hacer), En Curso o Terminado
   - **TDD**: Marca si escribirás pruebas antes del código
   - **Asignar Pareja**: Selecciona hasta dos miembros del equipo
   - **Criterios de Aceptación**: Agrega una lista de verificación ejecutable
4. Presiona **Guardar Tarjeta**
5. La tarjeta aparecerá en la lista. Puedes voltearla (haz clic) para ver los criterios de aceptación en el reverso.

### 4. Planificar una Iteración

1. Ve a **Iteraciones** para ver la línea de tiempo
2. Ve a **Juego de Planeación** (`/planning`)
3. Arrastra las historias desde la columna **Backlog** a la columna **En Curso**
4. Observa el encabezado de capacidad: si los puntos superan la capacidad de la iteración, se pondrá rojo
5. A medida que completes trabajo, mueve las tarjetas a **Terminado**

### 5. Realizar la Standup Diaria

1. Ve a **Standup Diaria** (`/standup`)
2. El temporizador de 10 minutos comienza automáticamente
3. Selecciona un miembro del equipo para que sea el orador activo
4. Responde las tres preguntas:
   - ¿Qué hice ayer?
   - ¿Qué haré hoy?
   - ¿Tengo algún impedimento?
5. Presiona **Guardar y Siguiente** para avanzar al siguiente miembro
6. Al terminar todos, la standup se completa y el historial queda registrado

### 6. Programar en Pareja

1. Ve a **Programación en Pareja** (`/pairs`)
2. Selecciona un **Conductor** (escribe el código) y un **Navegador** (revisa y guía)
3. Presiona **Iniciar Sesión en Pareja**
4. El temporizador comenzará a contar. Usa **Intercambiar Roles** para rotar periódicamente
5. Al terminar, presiona **Detener Sesión**. La sesión se guarda en el historial
6. La matriz de rotación se actualiza automáticamente y aparecen recomendaciones para evitar silos

   También hay un widget flotante en la esquina inferior derecha (`PairTracker`) que permite iniciar/detener sesiones desde cualquier página.

### 7. Ejecutar Pruebas TDD

1. Ve a **Pruebas (TDD)** (`/tests`)
2. Selecciona una historia de la lista de aceptación
3. Marca los criterios de aceptación que se han cumplido
4. Cuando todos los criterios estén marcados, aparecerá el botón **Aceptar y Desplegar Historia**
5. Presiona **Ejecutar Suite de Pruebas** para ver la simulación de Vitest
6. Activa **Ejecución Automática** para que las pruebas se ejecuten al actualizar una historia

### 8. Usar el Pipeline de CI/CD

1. Ve a **CI/CD** (`/ci`)
2. Presiona **Iniciar Pipeline de CI**
3. Observa las etapas en secuencia:
   - **Lint**: Validación de formato y estilo de código
   - **Test**: Ejecución de pruebas con verificación de umbrales XP
   - **Build**: Compilación del proyecto
   - **Deploy**: Despliegue de la compilación
4. Si la tasa de TDD es menor al 50% o hay deuda técnica de alta prioridad, el pipeline se aborta automáticamente

### 9. Registrar Deuda Técnica

1. Ve a **Refactorización** (`/refactors`)
2. Presiona **Registrar Deuda Técnica**
3. Completa el formulario: título, tipo (Deuda Técnica o Refactor), prioridad e historia relacionada
4. Marca la tarea como resuelta cuando se haya completado la refactorización
5. El medidor de salud del código se actualiza automáticamente

### 10. Realizar una Retrospectiva

1. Ve a **Retrospectivas** (`/retrospective`)
2. En la columna **Salió Bien**, agrega lo que funcionó en la iteración
3. En **Requiere Cambios**, anota los impedimentos o cuellos de botella
4. En **Acciones a Tomar**, define medidas concretas
5. Vota por las notas más importantes usando el botón 👍
6. Presiona **Exportar Retro MD** para descargar el archivo Markdown

### 11. Monitorear la Salud XP

1. Ve a **Salud XP** (`/health`)
2. Revisa los medidores de cumplimiento de prácticas XP
3. Analiza el gráfico de velocidad por iteración
4. Revisa el burndown chart para ver el progreso
5. Consulta el seguimiento de refactorización y deuda técnica

### 12. Gestionar el Equipo

1. Ve a **Equipo** (`/team`)
2. Revisa el monitor de ritmo sostenible: si alguien supera las 40 horas semanales, aparecerá una alerta
3. Usa **Agregar Miembro** para incorporar nuevos integrantes
4. Cada miembro tiene un avatar, rol y descripción de responsabilidades

---

## ⚙️ Configuración de Credenciales

Para el desarrollo local, XP-Flow utiliza credenciales por rol configuradas a través de variables de entorno. Siga estos pasos para configurarlas:

1. Copie el archivo de ejemplo:
   ```sh
   cp .env.credentials.example .env.credentials
   ```
2. Modifique el archivo `.env.credentials` con sus contraseñas locales. En desarrollo, si este archivo no se define, se utilizarán las credenciales locales de prueba definidas de forma segura en el proyecto.

---

## 🧪 Comandos de Desarrollo

| Comando             | Acción                                             |
| ------------------- | -------------------------------------------------- |
| `npm install`       | Instalar dependencias                              |
| `npm run dev`       | Iniciar servidor de desarrollo en `localhost:4321` |
| `npm run build`     | Compilar para producción en `./dist/`              |
| `npm run lint`      | Ejecutar ESLint                                    |
| `npm run typecheck` | Verificar tipos con TypeScript                     |
| `npm test`          | Ejecutar pruebas unitarias (Vitest)                |
| `npm run test:e2e`  | Ejecutar pruebas E2E (Playwright)                  |

---

## 🧑‍🤝‍🧑 Equipo XP Pioneers

| Miembro              | Rol XP             |
| -------------------- | ------------------ | --- |
| Christian Puchaicela | Coach (Entrenador) |
| Jahir Rocha          | Gestor             | n   |
| Ariel Rosas          | Cliente            |
| Kevin Palacios       | Programador        |
| Jhonathan Pulig      | Tester             |
| Santiago Pinta       | Tracker            |

Metáfora del sistema: **"The Factory Floor"** — el software funciona como una fábrica donde las historias de usuario son órdenes de trabajo que fluyen a través de estaciones (componentes), la programación en pareja son dos operadores en la misma máquina, y la velocidad es el rendimiento (throughput) de la línea de producción.

---

## 🛠️ Stack Tecnológico

- **Framework**: Astro 6 (SSR standalone, `@astrojs/node`)
- **UI**: React con componentes interactivos (islas Astro)
- **Estilos**: Tailwind CSS v4
- **Estado**: Nanostores con persistencia a localStorage
- **Drag & Drop**: `@dnd-kit`
- **Pruebas**: Vitest (unitarias), Playwright (E2E)
- **Lenguaje**: TypeScript estricto
- **Calidad**: ESLint, Prettier, Husky, commitlint

---

## 📁 Estructura del Proyecto

```
src/
├── api/             # Clientes HTTP para el backend REST
├── components/      # Componentes React (agrupados por dominio)
│   ├── ci/          # Pipeline de Integración Continua
│   ├── dashboard/   # Panel de control
│   ├── health/      # Gráficos de salud XP
│   ├── pair/        # Programación en pareja
│   ├── planning/    # Juego de planeación e iteraciones
│   ├── refactors/   # Refactorización y deuda técnica
│   ├── retro/       # Retrospectivas
│   ├── stories/     # Historias de usuario
│   ├── team/        # Equipo y standup diaria
│   ├── tests/       # Panel TDD
│   └── ui/          # Componentes genéricos (Button, Card, Modal, etc.)
├── content/         # Colecciones de contenido Astro (historias, iteraciones, logs)
├── layouts/         # Layouts de página (AppLayout, AuthLayout)
├── pages/           # Rutas de la aplicación
├── store/           # Nanostores (auth, stories, pairSession, logs, ui, etc.)
├── styles/          # Estilos globales
├── types/           # Tipos TypeScript compartidos
└── websocket/       # Cliente WebSocket
```
