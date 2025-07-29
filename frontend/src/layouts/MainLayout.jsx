import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { User, Gamepad2, Moon, Sun } from 'lucide-react';
import Logo from '/images/boombat.png';

const MainLayout = () => {
	return (
		<div>
			<header className="w-full flex items-center justify-between px-6 py-4 shadow bg-white">
				{/* Lewa strona: logo + napis */}
				<Link to="/dashboard" className="flex items-center gap-2">
					<img src={Logo} alt="Boom Bat Logo" className="h-12 w-auto" />
					<span className="text-xl font-bold text-gray-800">Boom Bat</span>
				</Link>
				<Moon />
				{/* Prawa strona: gry, profil, avatar */}
				<div className="flex items-center gap-4">
					<Link to="/dashboard/game1" className="text-gray-600 hover:text-blue-600 transition text-sm font-medium flex items-center gap-1">
						<Gamepad2 className="w-12 h-12" />
						Games
					</Link>

					<Link to="/dashboard/profile" className="text-gray-600 hover:text-blue-600 transition">
						<User className="w-12 h-12" />
					</Link>

					{/* Miejsce na  img monety i ile ich mamy na swoim koncie */}
					<div className="w-12 h-12 bg-gray-300 rounded-full"></div>
				</div>
			</header>

			<main className="p-6">
				<Outlet />
			</main>
		</div>
	);
};

export default MainLayout;
