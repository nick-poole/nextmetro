import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		watch: {
			usePolling: true,
			interval: 100,
		},
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
