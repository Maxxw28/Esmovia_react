import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { User, Gamepad2, Moon, Sun } from 'lucide-react';
import Logo from '/images/boombat.png';
import Coin from '/images/batcoin.png';
import '../index.css';
import Crash from '../pages/games/crash/crash.jsx';

const MainLayout = () => {
	const [darkMode, setDarkMode] = useState(false);
	const [user, setUser] = useState(null);

	useEffect(() => {
		document.documentElement.classList.toggle('dark', darkMode);
	}, [darkMode]);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	return (
		<div className="bg-white dark:bg-gray-900 min-h-screen transition-colors">
			<header className="w-full flex items-center justify-between px-6 py-4 shadow bg-white dark:bg-gray-800 transition-colors">
				{/* Lewa strona: logo + napis */}
				<Link to="/dashboard" className="flex items-center gap-2">
					<img src={Logo} alt="Boom Bat Logo" className="h-12 w-auto" />
					<span className="text-xl font-bold text-gray-800 dark:text-white">Boom Bat</span>
				</Link>

				{/* Prawa strona */}
				<div className="flex items-center gap-4">
					{/* Dark mode toggle */}
					<button
						onClick={() => setDarkMode(!darkMode)}
						className="relative w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-colors"
					>
						<span
							className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${darkMode ? 'translate-x-8' : ''}`}
						></span>
						<span className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center">
							<Sun className={`w-4 h-4 text-yellow-500 transition-opacity ${darkMode ? 'opacity-0' : 'opacity-100'}`} />
						</span>
						<span className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center">
							<Moon className={`w-4 h-4 text-gray-800 dark:text-gray-200 transition-opacity ${darkMode ? 'opacity-100' : 'opacity-0'}`} />
						</span>
					</button>

					{/* Games */}
					<Link
						to="/dashboard/game1"
						className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition text-sm font-medium flex items-center gap-1"
					>
						<Gamepad2 className="w-12 h-12" />
						Games
					</Link>

					{/* Profile */}
					<Link to="/dashboard/profile" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
						<User className="w-12 h-12" />
					</Link>

					{/* Punkty użytkownika */}
					<span className="text-xl font-bold text-gray-800 dark:text-white">
						{user?.points ?? 0}
					</span>

					{/* Ikona monet */}
					<div>
						<img src={Coin} alt="Boom Bat Logo" className="h-14 w-auto flex justify-center" />
					</div>
				</div>
			</header>

			<main className="p-6 text-gray-900 dark:text-white transition-colors">
				<Crash />
			</main>
		</div>
	);
};

export default MainLayout;
