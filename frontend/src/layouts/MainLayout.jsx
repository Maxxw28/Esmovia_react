import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { User, Gamepad2, Moon, Sun, Trophy } from 'lucide-react';
import Logo from '/images/boombat.png';
import Coin from '/images/batcoin.png';
import '../index.css';
import { useTheme } from '../utils/ThemeContext';

const MainLayout = () => {
	const { theme, toggleTheme } = useTheme();
	const [user, setUser] = useState(null);

	useEffect(() => {
		const updateUser = () => {
			const storedUser = localStorage.getItem('user');
			if (storedUser) {
				setUser(JSON.parse(storedUser));
			}
		};
		updateUser();

		// Nasłuchuj zmiany localStorage (np. po spinie ruletki)
		window.addEventListener('storage', updateUser);

		// Opcjonalnie: odświeżaj saldo co kilka sekund (jeśli zmiany są tylko lokalne)
		const interval = setInterval(updateUser, 1000);

		return () => {
			window.removeEventListener('storage', updateUser);
			clearInterval(interval);
		};
	}, []);

	return (
		<div className="flex flex-col min-h-screen transition-colors bg-white dark:bg-gray-900">
			{/* NAVBAR */}
			<header className="sticky top-0 z-50 shadow-md backdrop-blur bg-white/80 dark:bg-gray-800/80">
				<div className="flex items-center justify-between px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
					{/* Logo + Nazwa */}
					<Link to="/dashboard" className="flex items-center gap-2">
						<img src={Logo} alt="Boom Bat Logo" className="w-auto h-10" />
						<span className="text-2xl font-bold text-gray-800 dark:text-white">
							Boom Bat
						</span>
					</Link>

					{/* Menu */}
					<div className="flex items-center gap-6">
						{/* Tryb jasny/ciemny jako kafelek */}
						<button
							onClick={toggleTheme}
							title="Motyw"
							className="p-1 text-gray-600 transition rounded shadow-sm dark:text-gray-300 hover:text-indigo-500"
						>
							{theme === 'dark' ? (
								<Sun className="w-5 h-5" />
							) : (
								<Moon className="w-5 h-5" />
							)}
						</button>

						{/* Gry */}
						<Link
							to="/dashboard/games"
							title="Gry"
							className="p-1 text-gray-600 transition rounded shadow-sm dark:text-gray-300 hover:text-indigo-500"
						>
							<Gamepad2 className="w-5 h-5" />
						</Link>

						{/* Ranking */}
						<Link
							to="/dashboard/leaderboard"
							title="Ranking"
							className="p-1 text-gray-600 transition rounded shadow-sm dark:text-gray-300 hover:text-indigo-500"
						>
							<Trophy className="w-5 h-5" />
						</Link>
						{/* Profil */}
						<Link
							to="/dashboard/profile"
							title="Profil"
							className="p-1 text-gray-600 transition rounded shadow-sm dark:text-gray-300 hover:text-indigo-500"
						>
							{user?.avatar ? (
								<img
									src={user.avatar}
									alt="Avatar"
									className="object-cover w-8 h-8 border-2 border-gray-300 rounded-full shadow dark:border-white"
								/>
							) : (
								<User className="w-5 h-5" />
							)}
						</Link>
						{/* Punkty */}
						<div className="flex items-center gap-3 px-3 py-1 bg-purple-100 rounded-full select-none dark:bg-purple-700">
							<span className="text-lg font-semibold text-gray-800 dark:text-white">
								{user?.points?.toLocaleString('pl-PL') ?? 0}
							</span>
							<Link
								to="/dashboard/earnings"
								title="Zdobądź więcej"
								className="flex items-center justify-center transition bg-white rounded-full shadow-sm w-7 h-7 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500"
							>
								<img src={Coin} alt="BatCoin" className="w-auto h-5" />
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Główna zawartość */}
			<main className="flex-1 p-6 text-gray-900 transition-colors dark:text-white bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:via-gray-900 dark:to-purple-900">
				<Outlet />
			</main>
		</div>
	);
};

export default MainLayout;
