import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        console.error('Wylogowanie nie powiodło się');
      }
    } catch (error) {
      console.error('Błąd podczas wylogowania:', error);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const res = await fetch('http://localhost:5000/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: user.email,
            avatar: reader.result, // base64
          }),
        });

        const data = await res.json();
        if (res.ok) {
          const updatedUser = { ...user, avatar: reader.result };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          console.error('Błąd:', data.error);
        }
      } catch (error) {
        console.error('Błąd podczas wysyłania avatara:', error);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(avatarFile);
  };

  if (!user) return <p>Ładowanie danych użytkownika...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Witaj, {user.username}!</h1>
      <p>Email: {user.email}</p>
      <p>Punkty: {user.points}</p>

      {user.avatar && (
        <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full my-4" />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files[0])}
        className="my-2"
      />
      <button
        onClick={handleAvatarUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
      >
        {uploading ? 'Wysyłanie...' : 'Zapisz avatar'}
      </button>

      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Wyloguj się
      </button>
    </div>
  );
}
