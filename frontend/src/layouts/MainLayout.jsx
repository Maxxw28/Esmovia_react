import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { User, Gamepad2, Moon, Sun } from 'lucide-react';
import Logo from '/images/boombat.png';
import Coin from '/images/batcoin.png';
import '../index.css';
import { useTheme } from '../utils/ThemeContext';

const MainLayout = () => {
	const { theme, toggleTheme } = useTheme();
	const [user, setUser] = useState(null);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	return (
		<div className="min-h-screen transition-colors bg-white dark:bg-gray-900">
			<header className="flex items-center justify-between w-full px-6 py-4 transition-colors bg-white shadow dark:bg-gray-800">
				{/* Lewa strona: logo + napis */}
				<Link to="/dashboard" className="flex items-center gap-2">
					<img src={Logo} alt="Boom Bat Logo" className="w-auto h-12" />
					<span className="text-xl font-bold text-gray-800 dark:text-white">
						Boom Bat
					</span>
				</Link>

				{/* Prawa strona */}
				<div className="flex items-center gap-4">
					{/* Dark mode toggle */}
					<button
						onClick={toggleTheme}
						className="relative w-16 h-8 p-1 transition-colors bg-gray-300 rounded-full dark:bg-gray-600"
					>
						<span
							className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
								theme === 'dark' ? 'translate-x-8' : ''
							}`}
						></span>
						<span className="absolute flex items-center justify-center w-6 h-6 top-1 left-1">
							<Sun
								className={`w-4 h-4 text-yellow-500 transition-opacity ${
									theme === 'dark' ? 'opacity-0' : 'opacity-100'
								}`}
							/>
						</span>
						<span className="absolute flex items-center justify-center w-6 h-6 top-1 right-1">
							<Moon
								className={`w-4 h-4 text-gray-800 dark:text-gray-200 transition-opacity ${
									theme === 'dark' ? 'opacity-100' : 'opacity-0'
								}`}
							/>
						</span>
					</button>

					{/* Games */}
					<Link
						to="/dashboard/game1"
						className="flex items-center gap-1 text-sm font-medium text-gray-600 transition dark:text-gray-300 hover:text-blue-600"
					>
						<Gamepad2 className="w-12 h-12" />
					</Link>

					{/* Profile */}
					<Link
						to="/dashboard/profile"
						className="text-gray-600 transition dark:text-gray-300 hover:text-blue-600"
					>
						{user?.avatar ? (
							<img
								src={user.avatar}
								alt="Avatar"
								className="object-cover w-12 h-12 border-2 border-gray-400 rounded-full dark:border-white"
							/>
						) : (
							<User className="w-12 h-12" />
						)}
					</Link>
					<div className="flex justify-center bg-purple-200 direction-row rounded-3xl w-25">
						{/* Punkty użytkownika */}
						<span className="text-xl font-bold text-gray-800 dark:text-white">
							{user?.points ?? 0}
						</span>

						{/* Ikona monet */}
						<div>
							<Link to="/dashboard/earnings">
								<img
									src={Coin}
									alt="Boom Bat Logo"
									className="flex justify-center w-auto h-8"
								/>
							</Link>
						</div>
						<div>
							<Link to="/dashboard/earnings">
								<span className="text-xl font-bold">+</span>
							</Link>
						</div>
					</div>
				</div>
			</header>

			<main className="p-6 text-gray-900 transition-colors dark:text-white">
				<Outlet />
			</main>
		</div>
	);
};

export default MainLayout;
