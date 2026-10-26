import { CurriculumLevel } from '../types/lesson';
import { GitState } from '../types/git';

const createBaseState = (): GitState => ({
  commits: {
    c1: {
      id: 'c1',
      parentIds: [],
      message: 'Initial commit (README.md)',
      author: 'Estudiante <estudiante@gitacademy.dev>',
      timestamp: Date.now() - 3600000 * 4,
    },
  },
  branches: {
    main: {
      name: 'main',
      commitId: 'c1',
    },
  },
  tags: {},
  head: {
    type: 'branch',
    target: 'main',
  },
  staging: [],
  workingDir: ['index.html'],
  stash: [],
});

export const CURRICULUM: CurriculumLevel[] = [
  {
    id: 'nivel-1',
    title: 'Nivel 1: Fundamentos de Git',
    description: 'Comprende qué es un commit, el área de preparación (staging) y cómo registrar cambios.',
    icon: 'Terminal',
    lessons: [
      {
        id: 'intro-init',
        levelId: 'nivel-1',
        title: '1.1 Tu Primer Commit',
        category: 'Fundamentos',
        difficulty: 'Principiante',
        timeEstimate: '4 min',
        summary: 'Aprende a inspeccionar el estado del proyecto con git status, pasar archivos a staging y crear un commit.',
        initialState: createBaseState(),
        steps: [
          {
            title: '1. Inspecciona el estado de trabajo',
            explanation: 'Git monitorea los archivos en tu carpeta. Ejecuta `git status` para ver qué archivos han cambiado.',
            commandSuggestion: 'git status',
          },
          {
            title: '2. Agrega los cambios al Staging',
            explanation: 'Antes de guardar una foto de tu código (commit), debes preparar los archivos con `git add`.',
            commandSuggestion: 'git add .',
          },
          {
            title: '3. Guarda tu commit',
            explanation: 'Registra permanentemente tus cambios acompañados de un mensaje explicativo.',
            commandSuggestion: 'git commit -m "feat: agregar index.html"',
          },
        ],
        goalDescription: 'Crea al menos un nuevo commit en la rama main.',
        solutionCommands: ['git add .', 'git commit -m "feat: agregar index.html"'],
        tips: [
          'Puedes usar "git status" en cualquier momento para saber qué está pendiente.',
          'Usa mensajes claros en presente (por ejemplo: "feat: agregar login").',
        ],
      },
      {
        id: 'intro-history',
        levelId: 'nivel-1',
        title: '1.2 Explorando el Historial',
        category: 'Fundamentos',
        difficulty: 'Principiante',
        timeEstimate: '3 min',
        summary: 'Aprende a navegar el registro de cambios históricos usando git log y sus variantes.',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'chore: setup repo', author: 'Dev <dev@test.com>', timestamp: Date.now() - 7200000 },
            c2: { id: 'c2', parentIds: ['c1'], message: 'feat: setup homepage layout', author: 'Dev <dev@test.com>', timestamp: Date.now() - 3600000 },
            c3: { id: 'c3', parentIds: ['c2'], message: 'style: add tailwind colors', author: 'Dev <dev@test.com>', timestamp: Date.now() },
          },
          branches: { main: { name: 'main', commitId: 'c3' } },
          tags: { 'v1.0.0': { name: 'v1.0.0', commitId: 'c2' } },
          head: { type: 'branch', target: 'main' },
          staging: [],
          workingDir: [],
          stash: [],
        },
        steps: [
          {
            title: '1. Visualiza el historial completo',
            explanation: 'Ejecuta `git log` para ver autor, fecha, hash y mensaje de cada commit.',
            commandSuggestion: 'git log',
          },
          {
            title: '2. Visualiza el historial compacto',
            explanation: 'En terminales reales, `git log --oneline` te da una visión panorámica instantánea.',
            commandSuggestion: 'git log --oneline',
          },
        ],
        goalDescription: 'Ejecuta git log o crea un commit adicional para consolidar el aprendizaje.',
        solutionCommands: ['git log --oneline'],
        tips: ['Las etiquetas como v1.0.0 señalan hitos importantes o releases de software.'],
      },
    ],
  },
  {
    id: 'nivel-2',
    title: 'Nivel 2: Ramas y Navegación',
    description: 'Aprende a aislar nuevas funcionalidades y entender el puntero especial HEAD.',
    icon: 'GitBranch',
    lessons: [
      {
        id: 'branches-create',
        levelId: 'nivel-2',
        title: '2.1 Crear y Cambiar de Ramas',
        category: 'Ramas',
        difficulty: 'Principiante',
        timeEstimate: '5 min',
        summary: 'Las ramas permiten experimentar y desarrollar funciones sin romper el código de producción.',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'Initial commit', author: 'Dev <dev@test.com>', timestamp: Date.now() - 3600000 },
            c2: { id: 'c2', parentIds: ['c1'], message: 'Configuracion base', author: 'Dev <dev@test.com>', timestamp: Date.now() },
          },
          branches: { main: { name: 'main', commitId: 'c2' } },
          tags: {},
          head: { type: 'branch', target: 'main' },
          staging: [],
          workingDir: [],
          stash: [],
        },
        steps: [
          {
            title: '1. Crea una nueva rama',
            explanation: 'Crea una rama llamada `feature-login` con el comando `git branch feature-login`. Observa cómo aparece en el grafo.',
            commandSuggestion: 'git branch feature-login',
          },
          {
            title: '2. Cambia a la nueva rama',
            explanation: 'Usa `git checkout feature-login` (o el moderno `git switch feature-login`) para mover HEAD.',
            commandSuggestion: 'git checkout feature-login',
          },
          {
            title: '3. Realiza un commit en la nueva rama',
            explanation: 'Al hacer commit, solo `feature-login` avanzará, dejando `main` intacta.',
            commandSuggestion: 'git commit -m "feat: formulario de login"',
          },
        ],
        goalDescription: 'Crea la rama "feature-login", sitúate en ella y realiza al menos un commit.',
        solutionCommands: [
          'git branch feature-login',
          'git checkout feature-login',
          'git commit -m "feat: formulario de login"',
        ],
        tips: [
          'Atajo pro: Puedes crear y cambiar en un solo paso con `git checkout -b feature-login` o `git switch -c feature-login`.',
        ],
      },
      {
        id: 'branches-detached',
        levelId: 'nivel-2',
        title: '2.2 HEAD Desacoplado y Viaje en el Tiempo',
        category: 'Ramas',
        difficulty: 'Intermedio',
        timeEstimate: '5 min',
        summary: 'Entiende qué significa realmente HEAD y cómo moverte a cualquier commit antiguo del grafo.',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'Commit 1 (inicio)', author: 'Dev <dev@test.com>', timestamp: Date.now() - 7200000 },
            c2: { id: 'c2', parentIds: ['c1'], message: 'Commit 2 (agrega estilos)', author: 'Dev <dev@test.com>', timestamp: Date.now() - 3600000 },
            c3: { id: 'c3', parentIds: ['c2'], message: 'Commit 3 (agrega api)', author: 'Dev <dev@test.com>', timestamp: Date.now() },
          },
          branches: { main: { name: 'main', commitId: 'c3' } },
          tags: {},
          head: { type: 'branch', target: 'main' },
          staging: [],
          workingDir: [],
          stash: [],
        },
        steps: [
          {
            title: '1. Viaja al pasado (HEAD desacoplado)',
            explanation: 'Haz checkout directamente al hash del commit `c1`. Observa cómo HEAD se separa de la rama `main`.',
            commandSuggestion: 'git checkout c1',
          },
          {
            title: '2. Experimenta en el pasado',
            explanation: 'Haz un commit en este estado de HEAD desacoplado para ver cómo se crea una nueva bifurcación.',
            commandSuggestion: 'git commit -m "exp: prueba en c1"',
          },
          {
            title: '3. Regresa a la rama principal',
            explanation: 'Para volver al presente, haz checkout de nuevo a `main`.',
            commandSuggestion: 'git checkout main',
          },
        ],
        goalDescription: 'Experimenta con `git checkout c1` y luego regresa a `main`.',
        solutionCommands: ['git checkout c1', 'git checkout main'],
        tips: [
          'HEAD es simplemente un puntero simbólico que indica en qué commit estás trabajando en este instante.',
        ],
      },
    ],
  },
  {
    id: 'nivel-3',
    title: 'Nivel 3: Integración y Fusión',
    description: 'Domina las dos formas principales de unir código: Git Merge y Git Rebase.',
    icon: 'GitMerge',
    lessons: [
      {
        id: 'merge-fast-forward',
        levelId: 'nivel-3',
        title: '3.1 Fast-Forward Merge',
        category: 'Fusión',
        difficulty: 'Principiante',
        timeEstimate: '4 min',
        summary: 'Si la rama principal no tiene commits nuevos desde que bifurcaste, Git solo adelanta el puntero.',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'Base del proyecto', author: 'Dev <dev@test.com>', timestamp: Date.now() - 3600000 },
            c2: { id: 'c2', parentIds: ['c1'], message: 'Nueva funcionalidad lista', author: 'Dev <dev@test.com>', timestamp: Date.now() },
          },
          branches: {
            main: { name: 'main', commitId: 'c1' },
            feature: { name: 'feature', commitId: 'c2' },
          },
          tags: {},
          head: { type: 'branch', target: 'main' },
          staging: [],
          workingDir: [],
          stash: [],
        },
        steps: [
          {
            title: '1. Verifica en qué rama te encuentras',
            explanation: 'Siempre debes situarte en la rama receptora (`main`) antes de fusionar.',
            commandSuggestion: 'git status',
          },
          {
            title: '2. Fusiona la rama feature',
            explanation: 'Ejecuta `git merge feature`. Al no haber divergencia, el puntero `main` se adelanta a `c2`.',
            commandSuggestion: 'git merge feature',
          },
        ],
        goalDescription: 'Aplica `git merge feature` mientras te encuentras en `main` para hacer un Fast-forward.',
        solutionCommands: ['git merge feature'],
        tips: ['Un merge fast-forward no crea un nuevo commit de unión.'],
      },
      {
        id: 'merge-3way',
        levelId: 'nivel-3',
        title: '3.2 3-Way Merge (Commit de Fusión)',
        category: 'Fusión',
        difficulty: 'Intermedio',
        timeEstimate: '6 min',
        summary: 'Cuando ambas ramas han avanzado por separado, Git genera un commit especial con dos padres.',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'Ancestro común', author: 'Dev <dev@test.com>', timestamp: Date.now() - 7200000 },
            c2: { id: 'c2', parentIds: ['c1'], message: 'Ajuste en main', author: 'Dev <dev@test.com>', timestamp: Date.now() - 3600000 },
            c3: { id: 'c3', parentIds: ['c1'], message: 'Feature en rama secundaria', author: 'Dev <dev@test.com>', timestamp: Date.now() },
          },
          branches: {
            main: { name: 'main', commitId: 'c2' },
            feature: { name: 'feature', commitId: 'c3' },
          },
          tags: {},
          head: { type: 'branch', target: 'main' },
          staging: [],
          workingDir: [],
          stash: [],
        },
        steps: [
          {
            title: '1. Observa la divergencia en el grafo',
            explanation: 'Tanto `main` como `feature` salieron de `c1` pero tienen commits diferentes.',
          },
          {
            title: '2. Fusiona feature dentro de main',
            explanation: 'Ejecuta `git merge feature`. Git unirá ambas líneas y creará un nuevo commit de fusión.',
            commandSuggestion: 'git merge feature',
          },
        ],
        goalDescription: 'Crea un commit de merge fusionando `feature` en `main`.',
        solutionCommands: ['git merge feature'],
        tips: ['El commit de fusión tiene dos padres: el commit previo de main y el último de feature.'],
      },
      {
        id: 'rebase-intro',
        levelId: 'nivel-3',
        title: '3.3 Rebase: La Alternativa Lineal',
        category: 'Rebase',
        difficulty: 'Intermedio',
        timeEstimate: '6 min',
        summary: 'Rebase toma los commits de tu rama y los reproduce uno a uno encima de la rama base, manteniendo un historial perfectamente limpio y lineal.',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'Base de inicio', author: 'Dev <dev@test.com>', timestamp: Date.now() - 7200000 },
            c2: { id: 'c2', parentIds: ['c1'], message: 'Nuevos cambios en main', author: 'Dev <dev@test.com>', timestamp: Date.now() - 3600000 },
            c3: { id: 'c3', parentIds: ['c1'], message: 'Trabajo en mi rama', author: 'Dev <dev@test.com>', timestamp: Date.now() },
          },
          branches: {
            main: { name: 'main', commitId: 'c2' },
            'mi-rama': { name: 'mi-rama', commitId: 'c3' },
          },
          tags: {},
          head: { type: 'branch', target: 'mi-rama' },
          staging: [],
          workingDir: [],
          stash: [],
        },
        steps: [
          {
            title: '1. Sitúate en la rama que quieres actualizar',
            explanation: 'Ya estás en `mi-rama`. Queremos que se base en los últimos cambios de `main`.',
          },
          {
            title: '2. Ejecuta el rebase',
            explanation: 'Ejecuta `git rebase main`. Mira cómo el commit `c3` se traslada encima de `c2` con un nuevo hash.',
            commandSuggestion: 'git rebase main',
          },
        ],
        goalDescription: 'Aplica `git rebase main` desde `mi-rama` para reordenar la historia de forma lineal.',
        solutionCommands: ['git rebase main'],
        tips: [
          'Regla de oro: Nunca hagas rebase en ramas públicas compartidas (como main en un equipo grande).',
        ],
      },
    ],
  },
  {
    id: 'nivel-4',
    title: 'Nivel 4: Rescate y Técnicas Avanzadas',
    description: 'Aprende a resolver errores cotidianos: cherry-pick, reset, revert y stash.',
    icon: 'ShieldAlert',
    lessons: [
      {
        id: 'cherry-pick',
        levelId: 'nivel-4',
        title: '4.1 Cherry-Pick: Copia Quirúrgica',
        category: 'Avanzado',
        difficulty: 'Intermedio',
        timeEstimate: '5 min',
        summary: 'Aprende a tomar un commit específico de otra rama y copiarlo a tu rama actual sin traer todo el resto.',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'Base repo', author: 'Dev <dev@test.com>', timestamp: Date.now() - 7200000 },
            c2: { id: 'c2', parentIds: ['c1'], message: 'En main', author: 'Dev <dev@test.com>', timestamp: Date.now() - 3600000 },
            c3: { id: 'c3', parentIds: ['c1'], message: 'WIP experimental', author: 'Dev <dev@test.com>', timestamp: Date.now() - 1800000 },
            c4: { id: 'c4', parentIds: ['c3'], message: 'Fix crítico de seguridad', author: 'Dev <dev@test.com>', timestamp: Date.now() },
          },
          branches: {
            main: { name: 'main', commitId: 'c2' },
            experimental: { name: 'experimental', commitId: 'c4' },
          },
          tags: {},
          head: { type: 'branch', target: 'main' },
          staging: [],
          workingDir: [],
          stash: [],
        },
        steps: [
          {
            title: '1. Identifica el commit que necesitas',
            explanation: 'En la rama `experimental` hay un commit `c4` ("Fix crítico de seguridad") que nos urge tener en `main`.',
          },
          {
            title: '2. Aplica cherry-pick',
            explanation: 'Estando en `main`, ejecuta `git cherry-pick c4`.',
            commandSuggestion: 'git cherry-pick c4',
          },
        ],
        goalDescription: 'Copia el commit c4 en main mediante `git cherry-pick c4`.',
        solutionCommands: ['git cherry-pick c4'],
        tips: ['Cherry-pick genera un nuevo commit con contenido idéntico pero diferente hash y fecha.'],
      },
      {
        id: 'reset-revert',
        levelId: 'nivel-4',
        title: '4.2 Deshacer Cambios (Reset vs Revert)',
        category: 'Avanzado',
        difficulty: 'Avanzado',
        timeEstimate: '6 min',
        summary: 'Descubre cuándo usar `git reset` (reescribir historia local) frente a `git revert` (crear un commit inverso seguro para ramas remotas).',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'Versión estable', author: 'Dev <dev@test.com>', timestamp: Date.now() - 7200000 },
            c2: { id: 'c2', parentIds: ['c1'], message: 'Commit con un bug grave', author: 'Dev <dev@test.com>', timestamp: Date.now() },
          },
          branches: { main: { name: 'main', commitId: 'c2' } },
          tags: {},
          head: { type: 'branch', target: 'main' },
          staging: [],
          workingDir: [],
          stash: [],
        },
        steps: [
          {
            title: '1. Deshacer de forma segura con revert',
            explanation: 'Si el commit ya fue subido a GitHub, no queremos borrarlo; queremos anularlo creando un commit inverso.',
            commandSuggestion: 'git revert c2',
          },
          {
            title: '2. Retroceder puntero con reset (local)',
            explanation: 'Si el cambio solo estaba en tu máquina y quieres borrar el último commit: `git reset --hard HEAD~1`.',
            commandSuggestion: 'git reset --hard HEAD~1',
          },
        ],
        goalDescription: 'Aplica `git revert c2` o `git reset --hard HEAD~1` para solucionar el commit con bug.',
        solutionCommands: ['git revert c2'],
        tips: [
          'Usa `git revert` siempre que el código ya esté publicado en GitHub.',
          'Usa `git reset` solo para commits locales privados antes de hacer push.',
        ],
      },
      {
        id: 'git-stash',
        levelId: 'nivel-4',
        title: '4.3 Git Stash: Guardar Trabajo Temporal',
        category: 'Avanzado',
        difficulty: 'Intermedio',
        timeEstimate: '4 min',
        summary: '¿Necesitas cambiar de rama de emergencia sin hacer commit de tu código incompleto? Stash es tu salvavidas.',
        initialState: {
          commits: {
            c1: { id: 'c1', parentIds: [], message: 'Código listo', author: 'Dev <dev@test.com>', timestamp: Date.now() - 3600000 },
          },
          branches: { main: { name: 'main', commitId: 'c1' } },
          tags: {},
          head: { type: 'branch', target: 'main' },
          staging: [],
          workingDir: ['formulario-incompleto.tsx', 'api.ts'],
          stash: [],
        },
        steps: [
          {
            title: '1. Revisa tus cambios sin guardar',
            explanation: 'Ejecuta `git status` para ver los archivos modificados que aún no están listos para commit.',
            commandSuggestion: 'git status',
          },
          {
            title: '2. Guarda tus cambios en el cajón temporal',
            explanation: 'Ejecuta `git stash` para limpiar tu directorio de trabajo sin perder nada.',
            commandSuggestion: 'git stash',
          },
          {
            title: '3. Recupera tus cambios cuando estés listo',
            explanation: 'Cuando regreses a tu tarea, ejecuta `git stash pop` para restaurar los archivos guardados.',
            commandSuggestion: 'git stash pop',
          },
        ],
        goalDescription: 'Guarda tus cambios temporales con `git stash` y luego recupéralos con `git stash pop`.',
        solutionCommands: ['git stash', 'git stash pop'],
        tips: ['Puedes tener múltiples elementos en el stash usando `git stash list`.'],
      },
    ],
  },
  {
    id: 'nivel-5',
    title: 'Nivel 5: Dominando GitHub en la Práctica',
    description: 'Guías prácticas y flujos reales de trabajo en equipo usando github.com.',
    icon: 'Github',
    lessons: [
      {
        id: 'github-remotes',
        levelId: 'nivel-5',
        title: '5.1 Conectar Local con GitHub Real',
        category: 'GitHub Práctico',
        difficulty: 'Principiante',
        timeEstimate: '8 min',
        summary: 'Tutorial paso a paso para crear un repositorio en GitHub.com, vincularlo a tu terminal y hacer tu primer push.',
        isGitHubGuide: true,
        initialState: createBaseState(),
        steps: [],
        goalDescription: 'Sigue la guía práctica y conecta un repositorio real en tu cuenta de GitHub.',
        solutionCommands: [],
        tips: ['Configura siempre llaves SSH o un Personal Access Token (PAT) para no ingresar contraseñas.'],
        gitHubGuideContent: {
          overview: 'Aprende a conectar tu repositorio local de tu computadora con un nuevo repositorio remoto en tu cuenta de GitHub.',
          steps: [
            {
              action: '1. Crea el repositorio en GitHub',
              details: 'Inicia sesión en https://github.com, haz clic en el botón verde "New" (o "+") en la esquina superior derecha. Asigna el nombre a tu repositorio (ej. "mi-proyecto-git") y no selecciones "Add README" si ya tienes archivos en local.',
              commandOrUrl: 'https://github.com/new',
            },
            {
              action: '2. Vincula el remoto "origin"',
              details: 'Copia la URL de tu repositorio de GitHub (HTTPS o SSH) y agrégala en tu terminal local:',
              commandOrUrl: 'git remote add origin https://github.com/TU_USUARIO/mi-proyecto-git.git',
              tip: 'El nombre "origin" es simplemente el alias estándar para tu repositorio remoto principal.',
            },
            {
              action: '3. Nombra tu rama principal "main"',
              details: 'Por estándar de la industria, la rama principal se llama main:',
              commandOrUrl: 'git branch -M main',
            },
            {
              action: '4. Sube tus cambios a GitHub (Push)',
              details: 'Empuja tus commits locales al servidor remoto por primera vez:',
              commandOrUrl: 'git push -u origin main',
              tip: 'La bandera "-u" vincula la rama local con la remota, de modo que en el futuro solo necesitarás teclear "git push".',
            },
          ],
        },
      },
      {
        id: 'github-pull-requests',
        levelId: 'nivel-5',
        title: '5.2 El Flujo de Pull Requests (PRs)',
        category: 'GitHub Práctico',
        difficulty: 'Intermedio',
        timeEstimate: '10 min',
        summary: 'Cómo trabajar en equipo: crear ramas descriptivas, publicar cambios, abrir Pull Requests y solicitar revisiones.',
        isGitHubGuide: true,
        initialState: createBaseState(),
        steps: [],
        goalDescription: 'Comprende el ciclo de vida de un Pull Request desde la rama local hasta el Merge final.',
        solutionCommands: [],
        tips: [
          'Escribe descripciones claras en tus PRs explicando el "por qué" y adjuntando capturas de pantalla si hay cambios visuales.',
        ],
        gitHubGuideContent: {
          overview: 'Un Pull Request (PR) es la forma en que propones cambios a un proyecto y permites que tu equipo los revise, comente y apruebe antes de fusionarlos a producción.',
          steps: [
            {
              action: '1. Crea una rama de funcionalidad',
              details: 'Nunca hagas commits directamente sobre main en proyectos colaborativos:',
              commandOrUrl: 'git checkout -b feature/autenticacion-google',
            },
            {
              action: '2. Realiza tus commits y publícala en GitHub',
              details: 'Sube la nueva rama a GitHub:',
              commandOrUrl: 'git push -u origin feature/autenticacion-google',
            },
            {
              action: '3. Abre el Pull Request en la web de GitHub',
              details: 'Al entrar a tu repositorio en GitHub, verás un cartel amarillo que dice "Compare & pull request". Haz clic en él, escribe un título conciso y describe los cambios.',
            },
            {
              action: '4. Proceso de Code Review',
              details: 'Tus compañeros pueden dejar comentarios línea por línea, solicitar cambios o aprobar tu PR. Si haces nuevos commits en tu rama local y haces `git push`, el PR se actualizará automáticamente.',
            },
            {
              action: '5. Fusionar (Merge Pull Request)',
              details: 'Una vez aprobado, pulsa "Merge pull request" y luego "Delete branch" para mantener el repositorio limpio.',
            },
          ],
        },
      },
      {
        id: 'github-forks-oss',
        levelId: 'nivel-5',
        title: '5.3 Forks y Contribución Open Source',
        category: 'GitHub Práctico',
        difficulty: 'Avanzado',
        timeEstimate: '10 min',
        summary: 'Aprende a contribuir en proyectos de terceros donde no tienes permisos directos de escritura mediante la técnica del Fork.',
        isGitHubGuide: true,
        initialState: createBaseState(),
        steps: [],
        goalDescription: 'Domina el flujo Upstream y Fork para colaborar en proyectos globales.',
        solutionCommands: [],
        tips: [
          'Mantén siempre tu fork sincronizado con el repositorio original (upstream) para evitar conflictos de merge.',
        ],
        gitHubGuideContent: {
          overview: 'Hacer un "Fork" es clonar una copia completa de un repositorio ajeno bajo tu propia cuenta de GitHub, dándote total libertad para experimentar y luego enviar tus mejoras.',
          steps: [
            {
              action: '1. Haz clic en "Fork" en el repositorio ajeno',
              details: 'En la esquina superior derecha del proyecto en GitHub, haz clic en "Fork". Esto creará una copia en tu perfil: github.com/TU_USUARIO/proyecto.',
            },
            {
              action: '2. Clona tu fork a tu computadora',
              details: 'Descarga tu copia personal:',
              commandOrUrl: 'git clone https://github.com/TU_USUARIO/proyecto.git',
            },
            {
              action: '3. Configura el repositorio original como "upstream"',
              details: 'Para recibir las actualizaciones que los autores originales hagan en el futuro:',
              commandOrUrl: 'git remote add upstream https://github.com/AUTOR_ORIGINAL/proyecto.git',
            },
            {
              action: '4. Crea una rama y envía tu aporte',
              details: 'Crea una rama, haz tus commits, súbelos a tu fork y luego pulsa "Contribute" -> "Open pull request" para enviar el cambio a los mantenedores originales.',
            },
          ],
        },
      },
    ],
  },
];
