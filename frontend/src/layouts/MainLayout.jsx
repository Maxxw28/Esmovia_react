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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 dark:bg-gray-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo + Nazwa */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={Logo} alt="Boom Bat Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">Boom Bat</span>
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-6">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors"
              title="Przełącz motyw"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : ''
                }`}
              />
              <span className="absolute top-1 left-1 w-4 h-4">
                <Sun
                  className={`w-4 h-4 text-yellow-500 transition-opacity ${
                    theme === 'dark' ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </span>
              <span className="absolute top-1 right-1 w-4 h-4">
                <Moon
                  className={`w-4 h-4 text-gray-800 dark:text-gray-200 transition-opacity ${
                    theme === 'dark' ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </span>
            </button>

            {/* Gry */}
            <Link
              to="/dashboard/game1"
              title="Gry"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition shadow-sm rounded p-1"
            >
              <Gamepad2 className="w-5 h-5" />
            </Link>

            {/* Ranking */}
            <Link
              to="/dashboard/leaderboard"
              title="Ranking"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition shadow-sm rounded p-1"
            >
              <Trophy className="w-5 h-5" />
            </Link>
            {/* Profil */}
            <Link
              to="/dashboard/profile"
              title="Profil"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition shadow-sm rounded p-1"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-white shadow"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>
            {/* Punkty */}
            <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-700 select-none">
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                {user?.points?.toLocaleString('pl-PL') ?? 0}
              </span>
              <Link
                to="/dashboard/earnings"
                title="Zdobądź więcej"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 shadow-sm transition"
              >
                <img src={Coin} alt="BatCoin" className="h-5 w-auto" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Główna zawartość */}
      <main className="p-4 md:p-6 text-gray-900 dark:text-white transition-colors">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
