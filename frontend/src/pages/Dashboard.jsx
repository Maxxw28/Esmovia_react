import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <p>Ładowanie danych użytkownika...</p>;
  }

  return (
    <div>
      <h1>Witaj, {user.username}!</h1>
      <p>Twój email: {user.email}</p>
      <p>Twoje punkty: {user.points}</p>
    </div>
  );
}
