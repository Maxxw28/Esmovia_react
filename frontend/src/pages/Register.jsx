import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function App() {
  const borderRef = useRef(null);
  const animationRef = useRef(null);
  const angle = useRef(0);

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

  return (
    <div className="min-h-screen bg-[#f6f6f6] font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Boom Bat</h1>
          <span className="text-sm text-gray-500">v1.0.0</span>
        </div>
      </header>

      {/* Login Section */}
      <main className="flex items-center justify-center pt-24 px-4">
        <div className="relative w-full max-w-md rounded-xl p-[2px]">
          {/* Animated Border */}
          <div
            ref={borderRef}
            className="absolute -inset-1 rounded-xl"
            style={{
              background: 'conic-gradient(#8e44ad, #ecf0f1, #8e44ad)',
              filter: 'blur(1px)',
            }}
          ></div>

          {/* Content */}
          <div className="relative bg-white p-7 sm:p-10 rounded-xl shadow-md">
            <h2 className="text-xl font-medium text-gray-800 mb-5">
              Let's Signup
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
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
			  <div>
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
                  Confirm password
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
                Sign Up
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-6">
              You've already an account? <br />
              <Link to="/login" className="text-purple-600 hover:underline">
                 Log In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
