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
				accent: {
					'50': '#f3f2ff',
					'100': '#e9e8ff',
					'200': '#d5d4ff',
					'300': '#b7b1ff',
					'400': '#9385ff',
					'500': '#6647ff',
					'600': '#5e30f7',
					'700': '#501ee3',
					'800': '#4218bf',
					'900': '#38169c',
					'950': '#200b6a'
				},
				'accent-gradient': 'linear-gradient(121deg,#6e00ff,#2a00ff)',
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
					'950': '#2a2b3c'
				},
				bunker: {
					'50': '#f6f7f9',
					'100': '#eceef2',
					'200': '#d4d8e3',
					'300': '#afb7ca',
					'400': '#8390ad',
					'500': '#637294',
					'600': '#4f5b7a',
					'700': '#414a63',
					'800': '#383f54',
					'900': '#323848',
					'925': '#212430',
					'950': '#15171e',
				},
				mercury: {
					'50': '#f6f6f8',
					'100': '#e6e6ea',
					'200': '#dcdce1',
					'300': '#c3c4cd',
					'400': '#a6a6b4',
					'500': '#9190a1',
					'600': '#817f91',
					'700': '#757283',
					'800': '#63606d',
					'900': '#504f59',
					'950': '#343338',
				}
			}
		}
	},
	darkMode: 'selector',
	plugins: []
};