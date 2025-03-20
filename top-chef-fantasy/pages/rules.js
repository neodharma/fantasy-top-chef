// pages/rules.js
import React from 'react';
import Link from 'next/link';

const RulesPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Standings</Link>
          <h1 className="text-3xl font-bold text-center">Scoring Rules</h1>
          <div className="w-24"></div> {/* Empty div for balance */}
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p className="mb-4">
                Each team was given 4 chefs, with each chef able to be picked 3 times.
              </p>
              <p>
                As the season progresses, chefs earn points based on their successes (or failures) in each episode.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Scoring System</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-indigo-50 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Achievement</th>
                      <th className="px-6 py-3 bg-indigo-50 text-center text-xs font-medium text-indigo-800 uppercase tracking-wider">Points</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Winning Quickfire Challenge</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+3</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Top Section in Quickfire</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+1</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Bottom Section in Quickfire</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-red-600">-1</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Winning Elimination Challenge</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+5</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Top in Elimination Challenge</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+2</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Bottom in Elimination Challenge</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-red-600">-2</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Last Chance Kitchen Weekly Winner</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                <b>I'll try to update this as soon as I can on Fridays after I watch the episode!</b>
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Season Winner</h2>
              <p>
                The team with the most accumulated points at the end of the season will be crowned the 
                champion! The Top Top Chef Watcher! In case of a tie, the team with the most chefs remaining 
                in the finale will win. If still tied, the team with the highest-placed chef in the finale 
                wins.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;