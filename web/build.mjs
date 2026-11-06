import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
await build({ entryPoints: ['src/main.js'], bundle: true, format: 'iife', outfile: 'dist/bundle.js', target: 'es2022' });
cpSync('src/index.html', 'dist/index.html');
cpSync('sample.mp4', 'dist/sample.mp4');
console.log('built dist/');
