import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const borderRef = useRef(null);
  const animationRef = useRef(null);
  const angle = useRef(0);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Hasła się nie zgadzają');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Rejestracja udana! Możesz się teraz zalogować.');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Coś poszło nie tak');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] font-sans">
      {/* ... header itp ... */}
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
            <h2 className="text-xl font-medium text-gray-800 mb-5">Let's Signup</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm text-gray-600 mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1">Confirm password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition text-sm"
              >
                Sign Up
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-6">
              You've already an account? <br />
              <Link to="/login" className="text-purple-600 hover:underline">Log In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
