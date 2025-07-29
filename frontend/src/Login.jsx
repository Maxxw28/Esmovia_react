import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [form, setForm] = useState({ email: '', password: '' });
  const borderRef = useRef(null);
  const animationRef = useRef(null);
  const angle = useRef(0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with:', form);
    // Tu można dodać fetch/login request
  };

  // Animacja obracającego się gradientowego obramowania
  useEffect(() => {
    const animate = () => {
      angle.current += 0.7; // prędkość obrotu
      if (angle.current >= 360) angle.current = 0;

      if (borderRef.current) {
        borderRef.current.style.background = `conic-gradient(from ${angle.current}deg, #A315C2, #ffffff, #A315C2)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex justify-center max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">Boom Bat</h1>
        </div>
      </header>

      {/* Login Section */}
      <main className="flex items-center justify-center py-20 px-4">
        <div className="relative w-full max-w-md rounded-lg p-[2px]">
          {/* Animowane gradientowe obramowanie */}
          <div
            ref={borderRef}
            className="absolute -inset-1 rounded-2xl"
            style={{ background: 'conic-gradient(#A315C2, #ffffff, #A315C2)' }}
          ></div>

          {/* Główna zawartość kontenera */}
          <div className="relative bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              Login
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
