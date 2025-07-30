import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function App() {
  const borderRef = useRef(null);
  const animationRef = useRef(null);
  const angle = useRef(0);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' / 'error'

  const navigate = useNavigate();

  useEffect(() => {
    const animate = () => {
      angle.current += 0.6;
      if (angle.current >= 360) angle.current = 0;

      if (borderRef.current) {
        borderRef.current.style.background = `conic-gradient(from ${angle.current}deg, #8e44ad, #ecf0f1, #8e44ad)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const identifier = e.target.identifier.value;
    const password = e.target.password.value;

    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
        credentials: 'include', // jeśli backend używa cookies/session
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Zalogowano jako: ${data.user.username}`);
        setMessageType('success');

        // Zapisz w localStorage całego usera, łącznie z avatarem
        localStorage.setItem('user', JSON.stringify({
          username: data.user.username,
          points: data.user.points,
          email: data.user.email,
          id: data.user.id,
          avatar: data.user.avatar || '',
        }));

        // Przekieruj do dashboardu
        navigate('/dashboard');
      } else {
        setMessage(data.error || 'Błąd logowania');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Błąd połączenia:', err);
      setMessage('Błąd połączenia z serwerem');
      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] font-sans">
      <main className="flex items-center justify-center pt-24 px-4">
        <div className="relative w-full max-w-md rounded-xl p-[2px]">
          <div
            ref={borderRef}
            className="absolute -inset-1 rounded-xl"
            style={{
              background: 'conic-gradient(#8e44ad, #ecf0f1, #8e44ad)',
              filter: 'blur(1px)',
            }}
          ></div>

          <div className="relative bg-white p-7 sm:p-10 rounded-xl shadow-md">
            <h2 className="text-xl font-medium text-gray-800 mb-5">
              Log in to your account
            </h2>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="identifier" className="block text-sm text-gray-600 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition text-sm"
              >
                Log In
              </button>
            </form>

            {message && (
              <p
                className={`text-sm mt-4 text-center ${
                  messageType === 'success' ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {message}
              </p>
            )}

            <p className="text-xs text-center text-gray-400 mt-6">
              Don’t have an account? <br />
              <Link to="/register" className="text-purple-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
