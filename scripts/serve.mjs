import { spawn } from 'node:child_process';

const [python, ...options] = process.platform === 'win32' ? ['py', '-3'] : ['python3'];
const server = spawn(python, [...options, '-m', 'http.server', '8080'], { stdio: 'inherit' });

server.on('error', (error) => {
  console.error(`Impossible de lancer le serveur avec ${[python, ...options].join(' ')} (${error.message}).`);
  process.exitCode = 1;
});

server.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
