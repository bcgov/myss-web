#!/usr/bin/env node
// scripts/postbuild.js
// Copies index.html into dist/ and rewrites the script src to point to the built IIFE bundle.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const src = readFileSync(resolve(root, 'index.html'), 'utf-8');
const out = src
  .replace(
    '<script type="module" src="/src/EligibilityEstimator.svelte"></script>',
    '<script src="./eligibility-estimator.iife.js"></script>',
  )
  .replace('VITE_API_URL_PLACEHOLDER', process.env.VITE_API_URL || '')
  .replace('VITE_REGISTRATION_URL_PLACEHOLDER', process.env.VITE_REGISTRATION_URL || '');

writeFileSync(resolve(root, 'dist/index.html'), out);
console.log('postbuild: dist/index.html written');
