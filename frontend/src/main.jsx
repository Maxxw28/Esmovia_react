import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Game1 from './pages/Game1.jsx';
import Leaderboard from './pages/LeaderBoard.jsx'
import Selection from './pages/earnings/Selection.jsx';
import Miner from './pages/earnings/Miner.jsx';
import Roulette from './pages/games/roulette/Roulette.jsx';
import Clicker from './pages/earnings/Clicker.jsx';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import Crash from './pages/games/crash/Crash.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import NotFoundDashboard from './pages/NotFoundDashboard.jsx';
import VideoPage from './pages/earnings/VideoPage.jsx';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<HashRouter>
			<ThemeProvider>
				<Routes>
					<Route path="/" element={<App />} />
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<MainLayout />
							</ProtectedRoute>
						}
					>
						<Route index element={<Home />} />
						<Route path="profile" element={<Dashboard />} />
						
						<Route path="earnings">
							<Route index element={<Selection />} />
							<Route path="miner" element={<Miner />} />
							<Route path="clicker" element={<Clicker />} />
							<Route path="videopage" element={<VideoPage />}/>
						</Route>
						<Route path="game1" element={<Game1 />} />
						<Route path="leaderboard" element={<Leaderboard />} />
						<Route path="roulette" element={<Roulette />} />
						<Route path="crash" element={<Crash />} />
						<Route path="*" element={<NotFoundDashboard />} />
					</Route>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="*" element={<NotFoundPage />} />

				</Routes>
			</ThemeProvider>
		</HashRouter>
	</StrictMode>
);
