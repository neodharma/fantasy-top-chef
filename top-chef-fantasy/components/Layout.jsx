// components/Layout.jsx
import React from 'react';
import Link from 'next/link';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#4e2773] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Ben's Top Chef Fantasy League 2025! 🧑‍🍳🏆
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
                  Scores by Episode
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
            <p>&copy; {new Date().getFullYear()} Ben (& LLMs). Good luck!</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;