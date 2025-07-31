import { useEffect, useState } from 'react';
import { ThemeContext } from '../utils/ThemeContext';

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState();
	function toggleTheme() {
		if (theme === 'dark') {
			setTheme('light');
			localStorage.theme = 'light';
			document.documentElement.classList.remove('dark');
			console.info(
				`%cMotyw został pomyślnie zmieniony na jasny. %c`,
				'color: white;',
				'color: green;'
			);
		} else {
			setTheme('dark');
			localStorage.theme = 'dark';
			document.documentElement.classList.add('dark');
			console.info(
				`%cMotyw został pomyślnie zmieniony na ciemny. %c`,
				'color: white;',
				'color: green;'
			);
		}
	}
	function reloadTheme() {
		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
			setTheme('dark');
			console.info(
				`%cMotyw został pomyślnie odświeżony. %c`,
				'color: white;',
				'color: green;'
			);
		} else {
			document.documentElement.classList.remove('dark');
			setTheme('light');
			console.info(
				`%cMotyw został pomyślnie odświeżony. %c`,
				'color: white;',
				'color: green;'
			);
		}
	}
	function resetTheme() {
		localStorage.removeItem('theme');
		reloadTheme();
	}
	useEffect(() => {
		reloadTheme();
	}, []);
	return (
		<ThemeContext.Provider
			value={{ theme, toggleTheme, reloadTheme, resetTheme }}
		>
			{children}
		</ThemeContext.Provider>
	);
};
