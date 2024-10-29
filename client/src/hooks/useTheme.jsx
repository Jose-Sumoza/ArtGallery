import { useState } from "react";

const useTheme = () => {
	const [ isDark, setIsDark ] = useState(window.getThemePreference() === 'dark');

	const toggleTheme = () => {
		const html = document.documentElement;
		html.classList.toggle('dark');

		const isDark = html.classList.contains('dark');
		localStorage.setItem('theme', isDark ? 'dark' : 'light');

		setIsDark(isDark);
	};

	return {
		isDark,
		toggleTheme
	};
};

export default useTheme;