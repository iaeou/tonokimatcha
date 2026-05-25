#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
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

const runSync = (name, args, options = {}) => {
  const result = spawnSync(name, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const isMirrorRoot =
  existsSync(mirrorRoot) && realpathSync(projectRoot) === realpathSync(mirrorRoot);

if (!isMirrorRoot) {
  runSync('rsync', [
    '-a',
    '--delete',
    '--exclude',
    'node_modules',
    '--exclude',
    '.svelte-kit',
    '--exclude',
    '.git',
    '--exclude',
    '.DS_Store',
    `${projectRoot}/`,
    `${mirrorRoot}/`
  ]);
}

const hashInputs = ['package.json', 'package-lock.json']
  .map((file) => readFileSync(join(mirrorRoot, file)))
  .join('\n');
const dependencyHash = createHash('sha256').update(hashInputs).digest('hex');
const dependencyMarker = join(mirrorRoot, 'node_modules', '.tonoki-deps-hash');

if (
  !existsSync(join(mirrorRoot, 'node_modules')) ||
  !existsSync(dependencyMarker) ||
  readFileSync(dependencyMarker, 'utf8') !== dependencyHash
) {
  runSync('npm', ['ci'], { cwd: mirrorRoot });
  writeFileSync(dependencyMarker, dependencyHash);
}

const localBinary = join(mirrorRoot, 'node_modules', '.bin', command);
const executable = existsSync(localBinary) ? localBinary : command;
const child = spawn(executable, commandArgs, {
  cwd: mirrorRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    TONOKI_REAL_PROJECT_ROOT: projectRoot,
    TONOKI_CLEAN_PROJECT_ROOT: mirrorRoot
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(1);
  }

  process.exit(code ?? 0);
});
