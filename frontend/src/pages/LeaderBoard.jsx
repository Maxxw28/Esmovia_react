// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from 'react';

function Leaderboard() {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Pamiętaj, aby ten adres był poprawny
		fetch('http://localhost:5000/api/leaderboard')
			.then((res) => {
				if (!res.ok) throw new Error(`Błąd sieci: ${res.status}`);
				return res.json();
			})
			.then((res) => setData(res.leaderboard))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading)
		return <div className="p-4 text-center">Ładowanie rankingu...</div>;
	if (error)
		return (
			<div className="p-4 text-center text-red-500">Wystąpił błąd: {error}</div>
		);
	if (data.length === 0)
		return <div className="p-4 text-center">Brak graczy w rankingu.</div>;

	return (
		<div className="flex items-center justify-center h-full md:mt-6 lg:mt-10">
			<div className="w-full max-w-2xl p-6 mx-4 shadow-lg bg-gradient-to-br from-gray-50/50 to-gray-200/50 dark:from-black/50 dark:via-gray-900/50 dark:to-purple-900/50 sm:p-10 rounded-2xl">
				<h2 className="mb-6 text-3xl font-bold text-center text-gray-800 dark:text-white">
					Leaderboard 🏆
				</h2>
				<ol className="space-y-4">
					{data.map((user, idx) => (
						<li
							key={user.username}
							className="flex items-center p-3 transition-transform transform rounded-lg bg-gray-50/80 dark:bg-gray-800/80 hover:scale-105"
						>
							<span className="w-12 text-xl font-bold text-center text-gray-400 dark:text-gray-500">
								#{idx + 1}
							</span>
							<img
								src={
									user.avatar ||
									`https://api.dicebear.com/8.x/bottts/svg?seed=${user.username}`
								}
								alt="avatar"
								className="w-12 h-12 mx-4 border-2 border-gray-200 rounded-full dark:border-gray-700"
							/>
							<div className="flex-grow">
								<b className="text-lg text-gray-900 dark:text-white">
									{user.username}
								</b>
							</div>
							<div className="text-right">
								<span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
									{user.points.toLocaleString('pl-PL')} pkt
								</span>
							</div>
						</li>
					))}
				</ol>
			</div>
		</div>
	);
}

export default Leaderboard;
