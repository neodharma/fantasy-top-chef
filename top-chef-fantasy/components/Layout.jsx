// components/Layout.jsx
import React from 'react';
import Link from 'next/link';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Top Chef Fantasy
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="hover:text-indigo-200 transition-colors">
                  Standings
                </Link>
              </li>
              <li>
                <Link href="/chef-scores" className="hover:text-indigo-200 transition-colors">
                  Chef Scores
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-indigo-200 transition-colors">
                  Rules
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Top Chef Fantasy League</p>
            <p className="text-gray-400 text-sm mt-1">Not affiliated with Top Chef or Bravo TV.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;