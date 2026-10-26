import { PracticeWorkshop } from '../types/practice';

export const PRACTICES_DATABASE: PracticeWorkshop[] = [
  {
    id: 'workshop-repo-collab',
    title: 'Taller 1: Ciclo Completo de Repositorio y Colaboración Básica',
    shortDescription: 'Crea tu repositorio, configura la identidad local, haz tu primer push e invita a colaboradores para trabajar con ramas y Pull Requests.',
    category: 'Fundamentos y Trabajo en Equipo',
    difficulty: 'Principiante',
    estimatedTime: '15 min',
    iconName: 'FolderGit2',
    realWorldContext: 'Todo proyecto de software, ciencia de datos o ingeniería inicia con este ciclo fundamental: crear el hogar del código en GitHub, establecer la estructura base (.gitignore, README), sincronizar con la nube y conectar al equipo de trabajo para que nadie pise los cambios de otros.',
    learningObjectives: [
      'Crear un repositorio limpio en GitHub con visibilidad y archivos base.',
      'Clonar el repositorio localmente y verificar la configuración de usuario (name y email).',
      'Crear archivos de código, realizar commits atómicos con mensajes claros y hacer push a main.',
      'Invitar colaboradores a través de GitHub Settings con roles adecuados.',
      'Crear una rama de trabajo (feature branch), publicar en GitHub y abrir un Pull Request formal.'
    ],
    steps: [
      {
        title: 'Paso 1: Crear el repositorio en GitHub.com',
        explanation: 'Inicia sesión en GitHub, haz clic en el botón verde "New" o navega a https://github.com/new. Nombra el repositorio (ej. "mi-proyecto-colaborativo"), selecciona "Private" o "Public", y marca "Add a README file" y añade un .gitignore según tu lenguaje (Node, Python, Java).',
        command: 'https://github.com/new',
        tip: 'Tener un archivo .gitignore desde el día 1 evita que subas por accidente carpetas pesadas como node_modules/ o archivos con secretos .env.'
      },
      {
        title: 'Paso 2: Clonar el repositorio en tu computadora',
        explanation: 'Copia la URL HTTPS del repositorio desde el botón verde "<> Code" y clónalo en tu terminal en la carpeta donde organizas tus proyectos:',
        command: 'git clone https://github.com/TU_USUARIO/mi-proyecto-colaborativo.git\ncd mi-proyecto-colaborativo',
        tip: 'Verifica tu identidad en Git ejecutando: git config user.name && git config user.email'
      },
      {
        title: 'Paso 3: Crear el primer archivo y realizar un commit',
        explanation: 'Crea un archivo inicial en tu proyecto (por ejemplo `index.js` o `app.py`), revisa el estado del área de trabajo, agrégalo al staging y crea el commit con un mensaje descriptivo:',
        command: 'git status\ngit add .\ngit commit -m "feat: inicializar estructura base del proyecto"\ngit push origin main',
        codeSnippet: {
          filename: 'index.js',
          language: 'javascript',
          code: '// Archivo principal del proyecto\nconsole.log("¡Proyecto colaborativo inicializado con Git y GitHub!");\nmodule.exports = { status: "online" };'
        }
      },
      {
        title: 'Paso 4: Invitar a un compañero al repositorio',
        explanation: 'En GitHub.com, ve a la pestaña "Settings" del repositorio -> "Collaborators" -> haz clic en el botón verde "Add people" y escribe el nombre de usuario o correo de tu compañero. Tu compañero recibirá un correo y una notificación en GitHub para aceptar la invitación con rol "Write".',
        tip: 'Hasta que tu compañero acepte la invitación, figurará como "Pending Invite" y no podrá hacer push directo ni abrir ramas en el repo.'
      },
      {
        title: 'Paso 5: Flujo de colaboración con rama y Pull Request',
        explanation: 'Para que los colaboradores no envíen código directo a main, cada tarea se realiza en una rama separada:',
        command: 'git switch -c feature/pantalla-bienvenida\n# Realiza cambios en los archivos...\ngit add .\ngit commit -m "feat: agregar componente de bienvenida"\ngit push -u origin feature/pantalla-bienvenida',
        tip: 'Al hacer push, GitHub te mostrará un enlace directo en la terminal para abrir el Pull Request en tu navegador con un solo clic.'
      }
    ],
    verificationChecklist: [
      'El repositorio existe en GitHub con README.md y .gitignore.',
      'Tienes una copia local funcional conectada al remoto "origin".',
      'Tu compañero aceptó la invitación de colaborador en Settings > Collaborators.',
      'La rama feature/pantalla-bienvenida está publicada en GitHub.',
      'Existe un Pull Request abierto solicitando revisión antes de integrar a main.'
    ]
  },
  {
    id: 'workshop-docs-as-code',
    title: 'Taller 2: Docs-as-Code — Mantenimiento de Documentación Técnica con Git',
    shortDescription: 'Organiza documentación técnica en Markdown, implementa flujos de revisión por pares y publica un portal web automático con GitHub Pages.',
    category: 'Documentación y Gobernanza',
    difficulty: 'Principiante',
    estimatedTime: '20 min',
    iconName: 'BookOpen',
    realWorldContext: 'En las empresas modernas de tecnología, la documentación no se redacta en archivos Word ni en wikis obsoletas. Se aplica la metodología "Docs-as-Code": la documentación se escribe en Markdown, vive en el mismo repositorio del código, se audita mediante Pull Requests y se despliega automáticamente en la web con GitHub Pages.',
    learningObjectives: [
      'Estructurar una carpeta /docs profesional con manuales y especificaciones técnicas.',
      'Aplicar la metodología Docs-as-Code: versionado, historial y trazabilidad de cambios en manuales.',
      'Crear ramas específicas para redactar documentación (docs/guia-usuario) y someterlas a Pull Request.',
      'Activar y configurar GitHub Pages para publicar el sitio web de documentación en minutos.',
      'Crear archivos esenciales de gobernanza: README.md, CONTRIBUTING.md y CHANGELOG.md.'
    ],
    steps: [
      {
        title: 'Paso 1: Diseñar la estructura de carpetas /docs',
        explanation: 'Crea una carpeta llamada `docs/` en la raíz de tu proyecto para alojar los manuales técnicos, guías de arquitectura y especificaciones de API:',
        command: 'mkdir docs\ntouch docs/index.md docs/instalacion.md docs/arquitectura.md',
        codeSnippet: {
          filename: 'docs/index.md',
          language: 'markdown',
          code: '# Portal de Documentación Técnica\n\nBienvenido a la documentación oficial del sistema.\n\n> [!NOTE]\n> Esta documentación se mantiene bajo la metodología **Docs-as-Code** mediante Git.\n\n## Secciones Disponibles\n- [Guía de Instalación](instalacion.md)\n- [Arquitectura del Sistema](arquitectura.md)\n- [Guía para Contribuidores](../CONTRIBUTING.md)'
        }
      },
      {
        title: 'Paso 2: Crear el archivo de lineamientos CONTRIBUTING.md',
        explanation: 'Todo proyecto colaborativo debe explicar a nuevos integrantes cómo proponer cambios, qué estilo de Markdown usar y cómo abrir Pull Requests:',
        codeSnippet: {
          filename: 'CONTRIBUTING.md',
          language: 'markdown',
          code: '# Guía de Contribución al Proyecto\n\n¡Gracias por tu interés en mejorar este proyecto!\n\n## Proceso de Trabajo\n1. Crea una rama descriptiva: `docs/nombre-mejora` o `feat/nueva-funcion`.\n2. Escribe commits atómicos siguiendo Conventional Commits (`docs:`, `feat:`, `fix:`).\n3. Abre un Pull Request describiendo el propósito de tus cambios.\n4. Al menos 1 miembro del equipo debe aprobar el PR antes del merge.'
        }
      },
      {
        title: 'Paso 3: Crear rama de redacción y someter a revisión',
        explanation: 'Nunca edites documentación directamente en main. Crea una rama específica para la guía que estás redactando:',
        command: 'git switch -c docs/guia-despliegue\n# Redacta docs/despliegue.md con tus instrucciones...\ngit add docs/\ngit commit -m "docs: redactar guia paso a paso de despliegue en nube"\ngit push -u origin docs/guia-despliegue',
        tip: 'En el Pull Request, los revisores pueden usar la pestaña "Files changed" para comentar líneas exactas de los manuales en Markdown.'
      },
      {
        title: 'Paso 4: Activar GitHub Pages para publicar la web de docs',
        explanation: 'En tu repositorio de GitHub, ve a Settings -> Pages. En "Build and deployment", selecciona Source: "Deploy from a branch", Branch: "main", Folder: "/docs" y haz clic en "Save".',
        tip: 'En 60 segundos, GitHub desplegará tu web en https://TU_USUARIO.github.io/TU_REPO/ de forma gratuita y con certificado SSL automático.'
      },
      {
        title: 'Paso 5: Mantener el historial de versiones con CHANGELOG.md',
        explanation: 'Lleva el registro histórico de cambios ordenado cronológicamente según la convención Keep a Changelog:',
        codeSnippet: {
          filename: 'CHANGELOG.md',
          language: 'markdown',
          code: '# Registro de Cambios (Changelog)\n\n## [1.1.0] - 2026-10-26\n### Agregado\n- Nueva guía de despliegue en la carpeta /docs.\n- Soporte para GitHub Pages automático.\n\n## [1.0.0] - 2026-10-01\n### Agregado\n- Lanzamiento inicial de la documentación del sistema.'
        }
      }
    ],
    verificationChecklist: [
      'La carpeta /docs contiene archivos Markdown estructurados e interconectados.',
      'Existe un archivo CONTRIBUTING.md en la raíz que guía a los colaboradores.',
      'Los cambios de documentación se integraron a través de un Pull Request aprobado.',
      'GitHub Pages está activado en Settings > Pages apuntando a la carpeta /docs.',
      'El portal web de documentación es accesible públicamente a través de la URL de GitHub Pages.'
    ]
  },
  {
    id: 'workshop-hotfix-prod',
    title: 'Taller 3: Gestión de Hotfixes Críticos en Producción',
    shortDescription: 'Aprende a aislar un error crítico de producción desde un tag estable, corregirlo sin arrastrar código experimental y propagar el fix a main y develop.',
    category: 'Flujos de Rescate y DevOps',
    difficulty: 'Intermedio',
    estimatedTime: '20 min',
    iconName: 'ShieldAlert',
    realWorldContext: 'Es viernes por la tarde y surge un fallo crítico en producción con la versión v1.0.0 (por ejemplo, las compras no procesan pagos). La rama develop tiene 15 commits con funciones a medio hacer que NO pueden subirse a producción. Debes crear una rama de emergencia (hotfix) a partir del tag de producción, solucionar el bug, desplegar v1.0.1 y fusionar la solución tanto a main como a develop.',
    learningObjectives: [
      'Comprender la diferencia entre ramas de feature regulares y ramas de emergencia (hotfix).',
      'Crear una rama de hotfix basada en un tag o commit estable de producción.',
      'Aplicar la corrección quirúrgica mínima sin contaminar el entorno con código en desarrollo.',
      'Fusionar el hotfix a main, crear el tag de versión parche (v1.0.1) y desplegar.',
      'Re-integrar la solución a la rama develop para evitar regresiones en futuras versiones.'
    ],
    steps: [
      {
        title: 'Paso 1: Identificar el estado de producción y crear la rama hotfix',
        explanation: 'Asegúrate de tener main al día con el último tag estable de producción (v1.0.0) y crea la rama de hotfix directamente a partir de allí:',
        command: 'git checkout main\ngit pull origin main\ngit checkout -b hotfix/v1.0.1-fix-pago v1.0.0',
        tip: 'Crear la rama a partir del tag v1.0.0 garantiza que el código experimental que tus compañeros subieron a develop no entre a producción.'
      },
      {
        title: 'Paso 2: Aplicar la corrección quirúrgica del fallo',
        explanation: 'Corrige exclusivamente las líneas del archivo que causan el bug. No agregues mejoras estéticas ni refactorizaciones innecesarias:',
        command: 'git status\ngit diff\ngit add src/services/pago.js\ngit commit -m "fix(pago): corregir validacion de token bancario que causaba timeout"',
        codeSnippet: {
          filename: 'src/services/pago.js',
          language: 'javascript',
          code: '// Corrección urgente: aumentar timeout y sanitizar respuesta bancaria\nconst procesarPago = async (token) => {\n  if (!token) throw new Error("Token bancario inválido");\n  return await gateway.post("/charge", { token }, { timeout: 8000 });\n};'
        }
      },
      {
        title: 'Paso 3: Fusionar el hotfix a main y etiquetar la versión parche',
        explanation: 'Integra la solución a la rama principal (main), genera el tag de versión parche siguiendo SemVer (v1.0.1) y súbelo a GitHub para disparar el despliegue:',
        command: 'git checkout main\ngit merge --no-ff hotfix/v1.0.1-fix-pago -m "merge: hotfix v1.0.1 a produccion"\ngit tag -a v1.0.1 -m "Release v1.0.1 - Fix crítico de pagos en produccion"\ngit push origin main --tags',
        tip: 'Usar "--no-ff" garantiza que quede un commit de merge visible en el grafo que documente el momento exacto en que se desplegó la emergencia.'
      },
      {
        title: 'Paso 4: Propagar la solución a develop para evitar regresiones',
        explanation: '¡El paso que muchos olvidan! Si no fusionas el hotfix en develop, en la próxima versión v1.1.0 el bug volverá a aparecer:',
        command: 'git checkout develop\ngit pull origin develop\ngit merge --no-ff hotfix/v1.0.1-fix-pago -m "merge: integrar fix de pagos v1.0.1 en develop"\ngit push origin develop',
        tip: 'Si hay conflictos con código nuevo en develop, resuélvelos manteniendo la lógica del hotfix.'
      },
      {
        title: 'Paso 5: Limpieza de la rama de hotfix',
        explanation: 'Una vez que la corrección está integrada en main y en develop, la rama de hotfix ya cumplió su ciclo y debe ser eliminada:',
        command: 'git branch -d hotfix/v1.0.1-fix-pago\ngit push origin --delete hotfix/v1.0.1-fix-pago'
      }
    ],
    verificationChecklist: [
      'La rama hotfix se originó a partir del tag estable v1.0.0 sin código de develop.',
      'El fix corrigió de forma atómica y aislada el bug reportado.',
      'La rama main tiene el merge commit y el tag v1.0.1 creado.',
      'La rama develop recibió la misma corrección para evitar regresiones futuras.',
      'La rama temporal de hotfix fue eliminada tanto local como remotamente.'
    ]
  },
  {
    id: 'workshop-gitops-iac',
    title: 'Taller 4: GitOps e Infraestructura como Código (IaC)',
    shortDescription: 'Gestiona la configuración de servidores y despliegues mediante commits en Git, con auditoría total y rollback instantáneo con git revert.',
    category: 'DevOps y Cloud',
    difficulty: 'Intermedio',
    estimatedTime: '25 min',
    iconName: 'Server',
    realWorldContext: 'En entornos cloud modernos (Kubernetes, AWS, Docker), ningún ingeniero se conecta por SSH a cambiar configuraciones a mano. Se utiliza GitOps: todo cambio de infraestructura (memoria, réplicas, variables de entorno) se declara en archivos YAML dentro de Git. El historial de commits es la bitácora de auditoría de infraestructura y permite rollbacks automáticos en segundos.',
    learningObjectives: [
      'Comprender el paradigma GitOps: Git como la Única Fuente de Verdad para infraestructura.',
      'Versionar manifiestos declarativos de Docker Compose o Kubernetes en un repositorio.',
      'Modificar la configuración mediante un Pull Request auditado con revisiones obligatorias.',
      'Simular un fallo de configuración en producción y ejecutar un rollback instantáneo con git revert.',
      'Auditar el historial de cambios de infraestructura con git log y git blame.'
    ],
    steps: [
      {
        title: 'Paso 1: Crear la estructura del repositorio de infraestructura',
        explanation: 'Crea una carpeta de configuración con los manifiestos declarativos de tu servicio (por ejemplo, `docker-compose.yml` o manifiestos de Kubernetes):',
        command: 'mkdir -p infra/production\ntouch infra/production/docker-compose.yml infra/production/nginx.conf',
        codeSnippet: {
          filename: 'infra/production/docker-compose.yml',
          language: 'yaml',
          code: 'version: "3.8"\nservices:\n  api:\n    image: mi-empresa/api:v1.4.0\n    restart: always\n    ports:\n      - "8080:8080"\n    environment:\n      - NODE_ENV=production\n      - DB_POOL_SIZE=20\n    deploy:\n      replicas: 3\n      resources:\n        limits:\n          cpus: "1.0"\n          memory: 1024M'
        }
      },
      {
        title: 'Paso 2: Comprometer la infraestructura base en Git',
        explanation: 'Guarda la configuración inicial en el repositorio. Cada commit deja constancia del autor, la fecha y la justificación del cambio:',
        command: 'git add infra/\ngit commit -m "infra: definir manifiesto de produccion con 3 replicas y limites de memoria"\ngit push origin main'
      },
      {
        title: 'Paso 3: Proponer un cambio de infraestructura mediante Pull Request',
        explanation: 'Supongamos que necesitas escalar el servicio de 3 a 6 réplicas para el Black Friday. En GitOps, nunca editas main directamente; creas una rama:',
        command: 'git switch -c infra/scale-up-black-friday\n# Modifica replicas: 6 en infra/production/docker-compose.yml\ngit add infra/production/docker-compose.yml\ngit commit -m "infra: escalar replicas de 3 a 6 para alto trafico de Black Friday"\ngit push -u origin infra/scale-up-black-friday',
        tip: 'El equipo de infraestructura revisará el diff en el Pull Request: un simple "+ replicas: 6" antes de aprobar el merge.'
      },
      {
        title: 'Paso 4: Simular una mala configuración y ejecutar Rollback instantáneo',
        explanation: 'Supongamos que el cambio provocó saturación de base de datos. En GitOps no entras al servidor a editar; ejecutas un `git revert` para devolver la infraestructura a su estado previo de forma limpia y trazable:',
        command: 'git checkout main\ngit log --oneline -n 3\n# Revertir el commit que causó el problema:\ngit revert HEAD --no-edit\ngit push origin main',
        tip: 'El agente de GitOps (como ArgoCD o Flux) detectará el commit de revert en main y restaurará las 3 réplicas en segundos automáticamente.'
      },
      {
        title: 'Paso 5: Auditoría forense de infraestructura con git log y git blame',
        explanation: 'Para saber quién autorizó o cambió un parámetro de servidor en cualquier momento histórico:',
        command: 'git log -p -n 2 infra/production/docker-compose.yml\ngit blame infra/production/docker-compose.yml'
      }
    ],
    verificationChecklist: [
      'Los manifiestos de infraestructura están versionados en la carpeta infra/.',
      'El escalado de réplicas se propuso mediante un Pull Request con diff visual.',
      'El rollback se ejecutó limpiamente mediante git revert sin alterar el historial pasado.',
      'La bitácora de git log refleja con precisión qué se desplegó, quién lo autorizó y por qué.'
    ]
  },
  {
    id: 'workshop-open-source',
    title: 'Taller 5: Colaboración Profesional en Proyectos Open Source',
    shortDescription: 'Domina el flujo de Fork, remotos duales (origin y upstream), sincronización continua y Pull Requests comunitarios en proyectos externos.',
    category: 'Colaboración Comunitaria',
    difficulty: 'Intermedio',
    estimatedTime: '20 min',
    iconName: 'GitFork',
    realWorldContext: 'En proyectos de código abierto (o en repositorios corporativos con modelo InnerSource), no tienes permisos de escritura directa en el repositorio oficial. El flujo estándar de la industria exige hacer un "Fork" a tu cuenta, mantener sincronizada tu rama local con el repositorio original (upstream) y enviar tus propuestas mediante Pull Requests respetando las guías de contribución.',
    learningObjectives: [
      'Comprender el modelo Fork & Pull utilizado en el 100% de proyectos de código abierto.',
      'Crear un Fork de un repositorio y clonarlo a tu entorno local.',
      'Configurar el remoto "upstream" para recibir actualizaciones de los autores originales.',
      'Sincronizar tu rama local main con upstream antes de comenzar cualquier tarea.',
      'Crear una rama de contribución atómica y abrir un Pull Request hacia el repositorio original.'
    ],
    steps: [
      {
        title: 'Paso 1: Realizar el Fork en GitHub',
        explanation: 'Navega al repositorio público en el que deseas colaborar en GitHub.com (por ejemplo, una librería o herramienta comunitaria) y haz clic en el botón superior derecho "Fork". Selecciona tu cuenta personal y haz clic en "Create fork".',
        tip: 'El repositorio ahora existe bajo tu perfil: https://github.com/TU_USUARIO/nombre-proyecto con una copia exacta del código.'
      },
      {
        title: 'Paso 2: Clonar tu fork localmente',
        explanation: 'Clona TU fork (no el repositorio original) en tu computadora:',
        command: 'git clone https://github.com/TU_USUARIO/nombre-proyecto.git\ncd nombre-proyecto',
        tip: 'Comprueba que tu remoto origin apunte a tu fork ejecutando: git remote -v'
      },
      {
        title: 'Paso 3: Configurar el repositorio original como remoto "upstream"',
        explanation: 'Para poder recibir los cambios que los autores originales sigan subiendo con el tiempo, agrega el repositorio fuente con el nombre estándar "upstream":',
        command: 'git remote add upstream https://github.com/AUTOR_ORIGINAL/nombre-proyecto.git\ngit remote -v',
        tip: 'Ahora verás 2 pares de remotos: origin (tu fork personal) y upstream (el proyecto oficial de la comunidad).'
      },
      {
        title: 'Paso 4: Sincronizar tu copia con upstream antes de programar',
        explanation: 'Antes de tocar código, asegúrate de tener la versión más reciente del proyecto oficial:',
        command: 'git checkout main\ngit fetch upstream\ngit merge upstream/main\ngit push origin main',
        tip: 'Hacer esto regularmente te garantiza que nunca trabajarás sobre una base obsoleta ni generarás conflictos innecesarios.'
      },
      {
        title: 'Paso 5: Crear una rama de aporte y abrir el Pull Request',
        explanation: 'Crea una rama descriptiva, realiza tu mejora (por ejemplo, corrigiendo un typo o agregando un test), súbela a tu fork y abre el PR:',
        command: 'git switch -c fix/corregir-ortografia-readme\n# Edita el archivo y haz tu commit...\ngit add README.md\ngit commit -m "docs: corregir erratas ortograficas en seccion de instalacion"\ngit push -u origin fix/corregir-ortografia-readme',
        tip: 'Al ingresar a tu fork en GitHub.com, verás el banner "Compare & pull request". Asegúrate de que la base apunte a "AUTOR_ORIGINAL/main" y completa la plantilla de contribución.'
      }
    ],
    verificationChecklist: [
      'El fork existe bajo tu cuenta personal de GitHub.',
      'El comando git remote -v muestra correctamente ambos remotos (origin y upstream).',
      'Tu rama main local se mantiene sincronizada con upstream/main sin desvíos.',
      'La contribución se realizó en una rama separada y con commits atómicos.',
      'El Pull Request fue enviado hacia el repositorio original respetando los lineamientos de CONTRIBUTING.md.'
    ]
  }
];
