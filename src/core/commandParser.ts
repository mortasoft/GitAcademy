import { GitState, CommandResult } from '../types/git';
import { GitEngine, getHeadCommitId, getCommitHistory } from './gitEngine';

export class CommandParser {
  static execute(rawCommand: string, currentState: GitState): CommandResult {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      return { success: true, output: '' };
    }

    if (trimmed === 'clear' || trimmed === 'cls') {
      return { success: true, output: '__CLEAR__' };
    }

    if (trimmed === 'help' || trimmed === 'ayuda') {
      return {
        success: true,
        output: [
          'Comandos soportados en el simulador GitAcademy:',
          '  touch <archivo>                 Crear un archivo nuevo en el directorio',
          '  echo "texto" > <archivo>        Crear/escribir contenido en un archivo',
          '  ls                              Listar archivos del directorio de trabajo',
          '  cat <archivo>                   Ver contenido de un archivo',
          '  pwd                             Mostrar la ruta de trabajo actual',
          '',
          'Comandos de Git:',
          '  git status                      Ver estado del área de trabajo y staging',
          '  git add <archivo|.>             Agregar cambios al área de preparación',
          '  git restore --staged <archivo>  Desmarcar archivos del área de preparación',
          '  git commit -m "mensaje"         Crear un nuevo commit con los cambios',
          '  git branch [nombre]             Listar ramas o crear una nueva rama',
          '  git branch -d <nombre>          Eliminar una rama existente',
          '  git checkout <rama|commit>      Cambiar a una rama o commit',
          '  git checkout -b <nombre>        Crear y cambiar a una nueva rama',
          '  git switch [-c] <nombre>        Forma moderna de cambiar/crear ramas',
          '  git merge <rama>                Fusionar una rama con la actual',
          '  git rebase <rama>               Reorganizar commits sobre la rama base',
          '  git cherry-pick <commit>        Copiar un commit específico a HEAD',
          '  git reset [--hard|--soft] <id>  Retroceder el puntero de la rama',
          '  git revert <commit>             Crear un commit inverso para deshacer',
          '  git log [--oneline]             Mostrar el historial de commits',
          '  git tag <etiqueta>              Crear una etiqueta en el commit actual',
          '  git stash [pop]                 Guardar o recuperar cambios temporales',
          '  clear                           Limpiar la pantalla de la terminal',
        ].join('\n'),
      };
    }

    // Comandos de shell habituales: touch
    if (trimmed.startsWith('touch ') || trimmed === 'touch') {
      const parts = trimmed.split(/\s+/).slice(1).map((p) => p.replace(/["']/g, '')).filter(Boolean);
      if (parts.length === 0) {
        return { success: false, output: 'touch: falta el nombre del archivo operando' };
      }
      const newWorking = Array.from(new Set([...currentState.workingDir, ...parts]));
      return {
        success: true,
        output: '',
        newState: {
          ...currentState,
          workingDir: newWorking,
        },
      };
    }

    // echo ... > archivo
    if (trimmed.startsWith('echo ') && trimmed.includes('>')) {
      const redirectionParts = trimmed.split('>');
      const filename = redirectionParts[1]?.trim().replace(/["']/g, '');
      if (filename) {
        return {
          success: true,
          output: '',
          newState: {
            ...currentState,
            workingDir: Array.from(new Set([...currentState.workingDir, filename])),
          },
        };
      }
    }

    // ls / dir
    if (trimmed === 'ls' || trimmed.startsWith('ls ') || trimmed === 'dir') {
      const allFiles = Array.from(new Set(['README.md', ...currentState.staging, ...currentState.workingDir]));
      const formatted = allFiles.map((f) => {
        if (currentState.staging.includes(f)) return `\x1b[32m${f}\x1b[0m`;
        if (currentState.workingDir.includes(f)) return `\x1b[31m${f}\x1b[0m`;
        return f;
      }).join('  ');
      return {
        success: true,
        output: formatted || '(directorio vacío)',
      };
    }

    // cat
    if (trimmed.startsWith('cat ') || trimmed === 'cat') {
      const filename = trimmed.split(/\s+/)[1]?.replace(/["']/g, '');
      if (!filename) return { success: false, output: 'cat: falta nombre de archivo' };
      if (filename === 'README.md') return { success: true, output: '# Mi Proyecto Git\nRepositorio inicial.' };
      if (filename.endsWith('.html')) return { success: true, output: '<!DOCTYPE html>\n<html>\n  <body>Hola Mundo</body>\n</html>' };
      return { success: true, output: `// Contenido de ${filename}` };
    }

    // pwd
    if (trimmed === 'pwd') {
      return { success: true, output: '/workspace/proyecto-git' };
    }

    if (!trimmed.startsWith('git')) {
      return {
        success: false,
        output: `bash: comando no encontrado: '${trimmed}'. Usa 'git --help' o 'ayuda' para ver comandos soportados.`,
      };
    }

    // Dividir argumentos respetando comillas
    const args: string[] = [];
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let match;
    while ((match = regex.exec(trimmed)) !== null) {
      if (match[1] !== undefined) {
        args.push(match[1]); // texto dentro de comillas dobles
      } else if (match[2] !== undefined) {
        args.push(match[2]); // texto dentro de comillas simples
      } else {
        args.push(match[0]);
      }
    }

    const subCommand = args[1];

    if (!subCommand || subCommand === '--help') {
      return {
        success: true,
        output: "Uso: git [--version] [--help] <comando> [<argumentos>]\nComandos habituales: status, add, commit, branch, checkout, switch, merge, rebase, log, reset, revert.",
      };
    }

    // git status
    if (subCommand === 'status') {
      const headCommit = getHeadCommitId(currentState);
      const branchName = currentState.head.type === 'branch'
        ? `En la rama ${currentState.head.target}`
        : `HEAD desacoplado en ${headCommit}`;

      let body = `${branchName}\n`;
      if (currentState.staging.length > 0) {
        body += `Cambios para hacer commit:\n  (usa "git restore --staged <archivo>..." para desmarcar)\n`;
        currentState.staging.forEach((file) => {
          body += `    modificado:   \x1b[32m${file}\x1b[0m\n`;
        });
      }

      if (currentState.workingDir.length > 0) {
        body += `Archivos sin seguimiento / modificados:\n  (usa "git add <archivo>..." para incluir al commit)\n`;
        currentState.workingDir.forEach((file) => {
          body += `    modificado:   \x1b[31m${file}\x1b[0m\n`;
        });
      }

      if (currentState.staging.length === 0 && currentState.workingDir.length === 0) {
        body += `nada para hacer commit, el árbol de trabajo está limpio.`;
      }

      return {
        success: true,
        output: body,
      };
    }

    // git add
    if (subCommand === 'add') {
      const target = args[2];
      if (!target) {
        return { success: false, output: `Nada especificado, no se agregaron cambios.\nTal vez quisiste decir 'git add .'` };
      }

      let newStaging = [...currentState.staging];
      let newWorking = [...currentState.workingDir];

      if (target === '.' || target === '-A') {
        if (newWorking.length === 0 && newStaging.length === 0) {
          return {
            success: true,
            output: '',
            newState: currentState,
          };
        }
        newStaging = Array.from(new Set([...newStaging, ...newWorking]));
        newWorking = [];
      } else {
        newStaging = Array.from(new Set([...newStaging, target]));
        newWorking = newWorking.filter((f) => f !== target);
      }

      return {
        success: true,
        output: '',
        newState: {
          ...currentState,
          staging: newStaging,
          workingDir: newWorking,
        },
      };
    }

    // git restore
    if (subCommand === 'restore') {
      const isStaged = args.includes('--staged');
      const target = args[args.length - 1];
      if (isStaged && target && target !== '--staged') {
        const fileToUnstage = target === '.' ? currentState.staging : [target];
        const newStaging = currentState.staging.filter((f) => !fileToUnstage.includes(f));
        const newWorking = Array.from(new Set([...currentState.workingDir, ...fileToUnstage]));
        return {
          success: true,
          output: '',
          newState: {
            ...currentState,
            staging: newStaging,
            workingDir: newWorking,
          },
        };
      }
      return { success: false, output: 'Uso: git restore --staged <archivo>...' };
    }

    // git commit
    if (subCommand === 'commit') {
      let message = 'Cambio general';
      const mIdx = args.indexOf('-m');
      if (mIdx !== -1 && args[mIdx + 1]) {
        message = args[mIdx + 1];
      } else if (args.includes('-am') && args[args.indexOf('-am') + 1]) {
        message = args[args.indexOf('-am') + 1];
      }

      const res = GitEngine.commit(currentState, message);
      return {
        success: true,
        output: res.output,
        newState: res.newState,
        animation: { type: 'commit' },
      };
    }

    // git branch
    if (subCommand === 'branch') {
      const dIdx = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('-D');
      if (dIdx !== -1 && args[dIdx + 1]) {
        const branchToDelete = args[dIdx + 1];
        const res = GitEngine.deleteBranch(currentState, branchToDelete, true);
        return {
          success: res.success,
          output: res.output,
          newState: res.newState,
        };
      }

      const branchName = args[2];
      if (!branchName) {
        // Listar ramas
        const list = Object.keys(currentState.branches).map((b) => {
          const isCurrent = currentState.head.type === 'branch' && currentState.head.target === b;
          return `${isCurrent ? '* \x1b[32m' : '  '}${b}\x1b[0m`;
        }).join('\n');
        return { success: true, output: list };
      }

      const res = GitEngine.createBranch(currentState, branchName);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
        animation: { type: 'branch' },
      };
    }

    // git checkout
    if (subCommand === 'checkout') {
      if (args[2] === '-b' && args[3]) {
        const res = GitEngine.checkout(currentState, args[3], true);
        return {
          success: res.success,
          output: res.output,
          newState: res.newState,
          animation: { type: 'checkout' },
        };
      }

      const target = args[2];
      if (!target) {
        return { success: false, output: `error: falta especificar la rama o commit para checkout.` };
      }

      const res = GitEngine.checkout(currentState, target, false);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
        animation: { type: 'checkout' },
      };
    }

    // git switch
    if (subCommand === 'switch') {
      if (args[2] === '-c' && args[3]) {
        const res = GitEngine.checkout(currentState, args[3], true);
        return {
          success: res.success,
          output: res.output,
          newState: res.newState,
          animation: { type: 'checkout' },
        };
      }

      const target = args[2];
      if (!target) {
        return { success: false, output: `fatal: falta argumento para switch.` };
      }

      const res = GitEngine.checkout(currentState, target, false);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
        animation: { type: 'checkout' },
      };
    }

    // git merge
    if (subCommand === 'merge') {
      const targetBranch = args[2];
      if (!targetBranch) {
        return { success: false, output: `fatal: especifica una rama para fusionar.` };
      }

      const res = GitEngine.merge(currentState, targetBranch);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
        animation: { type: 'merge' },
      };
    }

    // git rebase
    if (subCommand === 'rebase') {
      const baseBranch = args[2];
      if (!baseBranch) {
        return { success: false, output: `fatal: especifica la rama base sobre la cual rebasar.` };
      }

      const res = GitEngine.rebase(currentState, baseBranch);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
        animation: { type: 'rebase' },
      };
    }

    // git cherry-pick
    if (subCommand === 'cherry-pick') {
      const commitTarget = args[2];
      if (!commitTarget) {
        return { success: false, output: `fatal: especifica el commit para cherry-pick.` };
      }

      const res = GitEngine.cherryPick(currentState, commitTarget);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
      };
    }

    // git reset
    if (subCommand === 'reset') {
      let mode: 'soft' | 'mixed' | 'hard' = 'mixed';
      let target = args[2];

      if (args[2] === '--hard') {
        mode = 'hard';
        target = args[3] || 'HEAD~1';
      } else if (args[2] === '--soft') {
        mode = 'soft';
        target = args[3] || 'HEAD~1';
      } else if (args[2] === '--mixed') {
        mode = 'mixed';
        target = args[3] || 'HEAD~1';
      }

      if (!target) target = 'HEAD~1';

      const res = GitEngine.reset(currentState, target, mode);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
        animation: { type: 'reset' },
      };
    }

    // git revert
    if (subCommand === 'revert') {
      const target = args[2];
      if (!target) {
        return { success: false, output: `fatal: especifica el commit para revertir.` };
      }

      const res = GitEngine.revert(currentState, target);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
      };
    }

    // git tag
    if (subCommand === 'tag') {
      const tagName = args[2];
      if (!tagName) {
        const tags = Object.keys(currentState.tags).join('\n') || '(no hay etiquetas)';
        return { success: true, output: tags };
      }

      const res = GitEngine.tag(currentState, tagName);
      return {
        success: res.success,
        output: res.output,
        newState: res.newState,
      };
    }

    // git log
    if (subCommand === 'log') {
      const headId = getHeadCommitId(currentState);
      if (!headId) {
        return { success: true, output: 'fatal: tu rama actual no tiene commits aún.' };
      }

      const history = getCommitHistory(headId, currentState.commits);
      const oneline = args.includes('--oneline');

      const lines = history.map((c) => {
        const branchesOnCommit = Object.values(currentState.branches)
          .filter((b) => b.commitId === c.id)
          .map((b) => b.name);
        
        const isHeadCommit = headId === c.id;
        const refLabels = [];
        if (isHeadCommit) {
          refLabels.push(currentState.head.type === 'branch' ? `HEAD -> ${currentState.head.target}` : 'HEAD');
        }
        refLabels.push(...branchesOnCommit.filter(b => !(isHeadCommit && currentState.head.type === 'branch' && currentState.head.target === b)));

        const tagLabels = Object.values(currentState.tags)
          .filter((t) => t.commitId === c.id)
          .map((t) => `tag: ${t.name}`);

        const allRefs = [...refLabels, ...tagLabels];
        const refStr = allRefs.length > 0 ? ` (${allRefs.join(', ')})` : '';

        if (oneline) {
          return `${c.id}${refStr} ${c.message}`;
        }

        return `commit ${c.id}${refStr}\nAutor: ${c.author}\nFecha: ${new Date(c.timestamp).toLocaleString()}\n\n    ${c.message}\n`;
      });

      return {
        success: true,
        output: lines.join(oneline ? '\n' : '\n'),
      };
    }

    // git stash
    if (subCommand === 'stash') {
      const action = args[2];
      if (action === 'pop') {
        if (currentState.stash.length === 0) {
          return { success: false, output: 'error: no stash entries found.' };
        }
        const popped = currentState.stash[0];
        const remaining = currentState.stash.slice(1);
        return {
          success: true,
          output: `En la rama principal: cambios recuperados del stash '${popped.message}'`,
          newState: {
            ...currentState,
            workingDir: ['cambios-recuperados.js'],
            stash: remaining,
          },
        };
      }

      if (currentState.workingDir.length === 0 && currentState.staging.length === 0) {
        return { success: true, output: 'No local changes to save' };
      }

      const newStashItem = {
        id: `stash@{${currentState.stash.length}}`,
        message: args[3] || 'WIP on branch',
        commitId: getHeadCommitId(currentState) || 'c1',
      };

      return {
        success: true,
        output: `Saved working directory and index state WIP on ${currentState.head.target}`,
        newState: {
          ...currentState,
          staging: [],
          workingDir: [],
          stash: [newStashItem, ...currentState.stash],
        },
      };
    }

    return {
      success: false,
      output: `git: '${subCommand}' no es un comando de git. Consulta 'ayuda'.`,
    };
  }
}
