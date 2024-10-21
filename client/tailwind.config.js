/** @type { import('tailwindcss').Config } */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: 'var(--color-primary)',
				secondary: 'var(--color-secondary)',
				accent: 'var(--color-accent)',
				'link-water': {
					'50': '#f3f6fa',
					'100': '#e3e8f2',
					'200': '#d8deed',
					'300': '#c1c9e0',
					'400': '#a7b0d2',
					'500': '#9097c4',
					'600': '#787ab3',
					'700': '#66689c',
					'800': '#54567f',
					'900': '#484a67',
					'950': '#2a2b3c',
				},
				'black-haze': 'var(--bg-color)'
			}
		}
	},
	plugins: []
};