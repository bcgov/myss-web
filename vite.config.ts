import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [sveltekit()],
		server: {
			allowedHosts: env.TRUST_HOST === 'true' ? true : undefined,
			proxy: env.TRUST_HOST === 'true'
				? {
						'/api-proxy': {
							target: env.API_BASE_URL || 'http://localhost:8080',
							changeOrigin: true,
							rewrite: (path: string) => path.replace(/^\/api-proxy/, ''),
						},
					}
				: undefined,
		}
	};
});
