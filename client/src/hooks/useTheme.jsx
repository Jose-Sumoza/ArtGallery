import { useState, useEffect } from "react";

const useTheme = () => {
	const [ isDark, setIsDark ] = useState(true);

	const toggleTheme = () => {
		const html = document.documentElement;
		html.classList.toggle('dark');

		const isDark = html.classList.contains('dark');
		localStorage.setItem('theme', isDark ? 'dark' : 'light');

		setIsDark(isDark);
	};

	useEffect(() => {
		setIsDark(window.getThemePreference() === "dark");
	}, []);

	return {
		isDark,
		toggleTheme
	};
};

export default useTheme;