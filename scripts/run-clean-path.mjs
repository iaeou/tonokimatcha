#!/usr/bin/env node
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  watch,
  writeFileSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const mirrorRoot = resolve(process.env.TONOKI_MIRROR_ROOT || '/tmp/tonoki-matcha-dev-src');
const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(scriptPath), '..');
const [command, ...commandArgs] = process.argv.slice(2);

if (!command) {
  console.error('Usage: node scripts/run-clean-path.mjs <binary> [...args]');
  process.exit(1);
}

const syncExcludes = [
  'node_modules',
  '.svelte-kit',
  '.git',
  '.DS_Store',
  '.playwright-cli',
  'output'
];

const syncMirror = ({ exitOnError = true } = {}) => {
  const result = spawnSync(
    'rsync',
    [
      '-a',
      '--delete',
      ...syncExcludes.flatMap((exclude) => ['--exclude', exclude]),
      `${projectRoot}/`,
      `${mirrorRoot}/`
    ],
    {
      cwd: projectRoot,
      stdio: 'inherit'
    }
  );

  if (result.status !== 0) {
    if (exitOnError) {
      process.exit(result.status ?? 1);
    }

    return false;
  }

  return true;
};

const syncMirrorPath = (filename, { exitOnError = false } = {}) => {
  const relativePath = String(filename);
  const sourcePath = join(projectRoot, relativePath);
  const targetPath = join(mirrorRoot, relativePath);

  if (!existsSync(sourcePath)) {
    rmSync(targetPath, { force: true, recursive: true });
    return true;
  }

  const sourceStats = statSync(sourcePath);
  const targetDirectory = sourceStats.isDirectory() ? targetPath : dirname(targetPath);
  mkdirSync(targetDirectory, { recursive: true });

  const result = spawnSync(
    'rsync',
    sourceStats.isDirectory()
      ? [
          '-a',
          '--delete',
          ...syncExcludes.flatMap((exclude) => ['--exclude', exclude]),
          `${sourcePath}/`,
          `${targetPath}/`
        ]
      : ['-a', sourcePath, `${targetDirectory}/`],
    {
      cwd: projectRoot,
      stdio: 'inherit'
    }
  );

  if (result.status !== 0) {
    if (exitOnError) {
      process.exit(result.status ?? 1);
    }

    return false;
  }

  return true;
};

const dependencyFiles = ['package.json', 'package-lock.json'];

const getDependencyHash = () =>
  createHash('sha256')
    .update(dependencyFiles.map((file) => readFileSync(join(mirrorRoot, file))).join('\n'))
    .digest('hex');

const ensureDependencies = ({ exitOnError = true } = {}) => {
  const dependencyHash = getDependencyHash();
  const dependencyMarker = join(mirrorRoot, 'node_modules', '.tonoki-deps-hash');

  if (
    existsSync(join(mirrorRoot, 'node_modules')) &&
    existsSync(dependencyMarker) &&
    readFileSync(dependencyMarker, 'utf8') === dependencyHash
  ) {
    return true;
  }

  const result = spawnSync('npm', ['ci'], {
    cwd: mirrorRoot,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    if (exitOnError) {
      process.exit(result.status ?? 1);
    }

    return false;
  }

  writeFileSync(dependencyMarker, dependencyHash);
  return true;
};

const isMirrorRoot =
  existsSync(mirrorRoot) && realpathSync(projectRoot) === realpathSync(mirrorRoot);

if (!isMirrorRoot) {
  syncMirror();
}

ensureDependencies();

const localBinary = join(mirrorRoot, 'node_modules', '.bin', command);
const executable = existsSync(localBinary) ? localBinary : command;
const isViteDevServer =
  command === 'vite' && !commandArgs.some((arg) => ['build', 'preview', '--help', '-h'].includes(arg));

let mirrorWatcher;
let mirrorPoller;
let mirrorSyncTimer;
let isSyncingMirror = false;
let needsFollowUpSync = false;
let needsFullMirrorSync = false;
const changedPaths = new Set();

const shouldIgnoreWatchedFile = (filename) => {
  if (!filename) {
    return false;
  }

  return String(filename)
    .split(/[\\/]/)
    .some((part) => syncExcludes.includes(part));
};

const scheduleMirrorSync = (filename) => {
  if (shouldIgnoreWatchedFile(filename)) {
    return;
  }

  if (filename) {
    changedPaths.add(String(filename));
  } else {
    needsFullMirrorSync = true;
  }

  clearTimeout(mirrorSyncTimer);
  mirrorSyncTimer = setTimeout(syncProjectChanges, 80);
};

const syncProjectChanges = () => {
  if (isSyncingMirror) {
    needsFollowUpSync = true;
    return;
  }

  isSyncingMirror = true;

  const pathsToSync = [...changedPaths];
  const shouldRunFullSync = needsFullMirrorSync || pathsToSync.length === 0;
  const shouldEnsureDependencies =
    shouldRunFullSync || pathsToSync.some((path) => dependencyFiles.includes(path));

  changedPaths.clear();
  needsFullMirrorSync = false;

  try {
    const synced = shouldRunFullSync
      ? syncMirror({ exitOnError: false })
      : pathsToSync.every((path) => syncMirrorPath(path, { exitOnError: false }));

    if (synced && shouldEnsureDependencies) {
      ensureDependencies({ exitOnError: false });
    }
  } finally {
    isSyncingMirror = false;

    if (needsFollowUpSync) {
      needsFollowUpSync = false;
      scheduleMirrorSync();
    }
  }
};

const child = spawn(executable, commandArgs, {
  cwd: mirrorRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    TONOKI_REAL_PROJECT_ROOT: projectRoot,
    TONOKI_CLEAN_PROJECT_ROOT: mirrorRoot
  }
});

if (!isMirrorRoot && isViteDevServer) {
  try {
    mirrorWatcher = watch(projectRoot, { recursive: true }, (_event, filename) => {
      scheduleMirrorSync(filename);
    });
    console.log(`Watching ${projectRoot} and syncing changes to ${mirrorRoot}`);
  } catch (error) {
    console.warn(
      `Recursive file watching is unavailable (${error.message}). Falling back to 1s mirror sync polling.`
    );
    mirrorPoller = setInterval(syncProjectChanges, 1000);
  }
}

const cleanup = () => {
  mirrorWatcher?.close();
  clearInterval(mirrorPoller);
  clearTimeout(mirrorSyncTimer);
};

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    cleanup();
    child.kill(signal);
  });
}

child.on('exit', (code, signal) => {
  cleanup();

  if (signal) {
    process.exit(1);
  }

  process.exit(code ?? 0);
});
