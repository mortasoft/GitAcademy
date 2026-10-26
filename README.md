# GitAcademy 🎓

Plataforma interactiva para aprender, capacitar y dominar **Git** y **GitHub**. Diseñada tanto para impartir talleres presenciales y remotos como para el autoaprendizaje y consulta rápida de referencia.

---

## 🌟 Características Principales

1. **Terminal Virtual Interactiva:**
   - Soporta comandos esenciales de Git: `status`, `add`, `commit`, `branch`, `checkout`, `switch`, `merge`, `rebase`, `cherry-pick`, `reset`, `revert`, `tag`, `stash`, `log`, etc.
   - Historial de comandos con flechas de dirección (Arriba/Abajo) y autocompletado con tecla `Tab`.
   - Inserción rápida de sugerencias de comandos desde las lecciones.

2. **Visualizador de Grafo Reactivo en Vivo:**
   - Representación SVG interactiva de nodos de commits, ramas en carriles paralelos, conexiones bezier de fusión (merges) y puntero especial `HEAD`.
   - Controles de zoom (acercar, alejar, restablecer) y selección interactiva de commits para inspeccionar detalles y metadatos.

3. **Modo Taller / Presentador (Instructor):**
   - Vista para proyectar en capacitaciones con tipografía grande y alto contraste.
   - Diapositivas paso a paso controlables con teclado (`Flecha derecha` / `Flecha izquierda`).
   - Cronómetro integrado para actividades prácticas (5 minutos ajustables).
   - Botón de **"Revelar Solución"** para demostrar comandos y grafos en vivo ante la audiencia.

4. **Guía y Referencia Contextual (Command Palette `Ctrl+K`):**
   - Buscador rápido por casos de uso reales (*"¿Cómo deshago un commit?"*, *"¿Cómo resuelvo un conflicto?"*, etc.).
   - Botón **"Probar en simulador"**: Recrea escenarios problemáticos directamente en el simulador para practicar soluciones de forma segura.

5. **Currículo Completo de 5 Niveles (100% en Español):**
   - **Nivel 1:** Fundamentos de Git (commits, staging, historial).
   - **Nivel 2:** Ramas y Navegación (bifurcaciones, HEAD desacoplado).
   - **Nivel 3:** Integración y Fusión (Fast-Forward, 3-Way Merge, Rebase).
   - **Nivel 4:** Rescate y Técnicas Avanzadas (Cherry-pick, Reset, Revert, Stash).
   - **Nivel 5:** Dominando GitHub en la Práctica (Remotos, Pull Requests, Code Review, Forks y Upstream).

6. **Despliegue y Arquitectura en Firebase:**
   - Configurado con `firebase.json` y `.firebaserc` para **Firebase Hosting** con reglas de reescritura SPA y caché de assets.
   - Capa de servicio modular (`src/services/firebase.ts`) lista con variables de entorno para activar Firebase Authentication y Cloud Firestore.

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ (recomendado Node 20+)
- npm o pnpm

### Instalación y Ejecución Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en Vite
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

---

## 🔥 Despliegue en Firebase Hosting

1. Asegúrate de tener instalado el CLI de Firebase:
   ```bash
   npm install -g firebase-tools
   ```
2. Inicia sesión en Firebase:
   ```bash
   firebase login
   ```
3. Construye la aplicación:
   ```bash
   npm run build
   ```
4. Despliega a Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

Si deseas vincular tu propio ID de proyecto de Firebase, edita el archivo `.firebaserc`:
```json
{
  "projects": {
    "default": "tu-id-de-proyecto-en-firebase"
  }
}
```

---

## 📂 Estructura del Proyecto

```
GitAcademy/
├── firebase.json              # Configuración de Firebase Hosting
├── .firebaserc                # Alias del proyecto de Firebase
├── src/
│   ├── components/            # Componentes React (Navbar, Terminal, GitGraph, LessonSidebar...)
│   ├── core/                  # Motores de simulación (gitEngine, commandParser, graphLayout)
│   ├── data/                  # Currículo de lecciones y base de datos de cheatsheet
│   ├── services/              # Integración con Firebase y persistencia LocalStorage
│   ├── types/                 # Interfaces TypeScript de Git, lecciones y usuarios
│   ├── App.tsx                # Aplicación principal
│   ├── main.tsx               # Punto de entrada de React
│   └── index.css              # Estilos Tailwind CSS
└── dist/                      # Salida compilada optimizada para producción
```
