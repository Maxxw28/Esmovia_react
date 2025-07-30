import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login'); // jeśli nie ma usera w localStorage, idź do logowania
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        localStorage.removeItem('user'); // wyczyść usera
        navigate('/login');
      } else {
        console.error('Wylogowanie nie powiodło się');
      }
    } catch (error) {
      console.error('Błąd podczas wylogowania:', error);
    }
  };

  if (!user) {
    return <p>Ładowanie danych użytkownika...</p>;
  }

  return (
    <div>
      <h1>Witaj, {user.username}!</h1>
      <p>Twój email: {user.email}</p>
      <p>Twoje punkty: {user.points}</p>

      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Wyloguj się
      </button>
    </div>
  );
}
