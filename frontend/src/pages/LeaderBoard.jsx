// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from 'react';

function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pamiętaj, aby ten adres był poprawny
    fetch('http://localhost:5000/api/leaderboard') 
      .then(res => {
        if (!res.ok) throw new Error(`Błąd sieci: ${res.status}`);
        return res.json();
      })
      .then(res => setData(res.leaderboard))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-4">Ładowanie rankingu...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Wystąpił błąd: {error}</div>;
  if (data.length === 0) return <div className="text-center p-4">Brak graczy w rankingu.</div>;

  return (
    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Leaderboard 🏆
      </h2>
      <ol className="space-y-4">
        {data.map((user, idx) => (
          <li
            key={user.username}
            className="flex items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg transition-transform transform hover:scale-105"
          >
            {/* Pozycja w rankingu */}
            <span className="text-xl font-bold text-gray-400 dark:text-gray-500 w-12 text-center">
              #{idx + 1}
            </span>

            {/* Awatar */}
            <img
              src={user.avatar || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.username}`} // Domyślny awatar, jeśli brak
              alt="avatar"
              className="w-12 h-12 rounded-full mx-4 border-2 border-gray-200 dark:border-gray-700"
            />
            
            {/* Nazwa użytkownika */}
            <div className="flex-grow">
              <b className="text-lg text-gray-900 dark:text-white">{user.username}</b>
            </div>

            {/* Punkty */}
            <div className="text-right">
                <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                    {user.points.toLocaleString('pl-PL')} pkt
                </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;
