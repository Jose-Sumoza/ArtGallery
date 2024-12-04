import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [ react() ],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true
			},
			'/user': {
				target: 'http://localhost:8080'
			}
		}
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@apis': resolve(__dirname, './src/api/index'),
			'@assets': resolve(__dirname, './src/assets'),
			'@components': resolve(__dirname, './src/components'),
			'@consts': resolve(__dirname, './src/consts'),
			'@hooks': resolve(__dirname, './src/hooks'),
			'@icons': resolve(__dirname, './src/assets/icons/index'),
			'@pages': resolve(__dirname, './src/pages/index'),
			'@sections': resolve(__dirname, './src/sections/index')
		}
	},
	build: {
		minify: 'terser',
		cssMinify: 'lightningcss'
	}
});