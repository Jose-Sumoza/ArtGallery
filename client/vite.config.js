import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import csp from "vite-plugin-csp-guard";

export default defineConfig({
	plugins: [
		react(),
		csp({
			dev: {
				run: true,
				outlierSupport: [ 'tailwind' ], 
			},
			policy: {
				"default-src": [ "'self'" ],
				"script-src": [ "'self'" ],
				"font-src": [ "'self'" ],
				"img-src": [
					"'self'",
					"https://res.cloudinary.com",
					"https://cdnjs.cloudflare.com/ajax/libs/twemoji/"
				],
				"style-src": [ "'self'" ],
				"script-src-elem": [ "'self'" ],
				"style-src-elem": [ "'self'", "'unsafe-inline'" ]
			},
			override: true
		})
	],
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