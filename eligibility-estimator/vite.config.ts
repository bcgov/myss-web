import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: preprocess(),
      compilerOptions: {
        // customElement is declared per-component via <svelte:options>
        // Do not set customElement: true globally — that forces ALL .svelte
        // files to be custom elements. Only the root component needs it.
      },
    }),
  ],
  build: {
    lib: {
      entry: 'src/EligibilityEstimator.svelte',
      name: 'EligibilityEstimator',
      fileName: 'eligibility-estimator',
      // IIFE: loads via a plain <script> tag, no module bundler needed.
      // ES: for use in projects that import it as an ES module.
      formats: ['iife', 'es'],
    },
    rollupOptions: {
      // Keep all dependencies bundled — consumers embed one JS file,
      // they do not manage a node_modules tree.
      external: [],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.ts'],
    server: {
      deps: {
        inline: [/svelte/],
      },
    },
  },
});
