// pages/rules.js
import React from 'react';
import Link from 'next/link';

const RulesPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Standings</Link>
          <h1 className="text-3xl font-bold text-center">Top Chef Fantasy League Rules</h1>
          <div className="w-24"></div> {/* Empty div for balance */}
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p className="mb-4">
                Welcome to the Top Chef Fantasy League! This page explains how our fantasy league works,
                the scoring system, and how to participate.
              </p>
              <p>
                Each participant drafts a team of chefs from the current season of Top Chef. As the season
                progresses, chefs earn points based on their performance in each episode.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Team Formation</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Each team consists of 3 chefs from the current Top Chef season</li>
                <li>Team rosters are finalized before the first episode airs</li>
                <li>Once the season begins, team rosters are locked</li>
                <li>If one of your chefs is eliminated, they continue to be part of your roster but will not earn additional points</li>
              </ul>
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
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+5</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Top 3 in Quickfire</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+3</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Winning Elimination Challenge</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+10</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Top 3 in Elimination Challenge</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+5</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Bottom 3 in Elimination Challenge</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-red-600">-3</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Eliminated</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-red-600">-5</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Winning Restaurant Wars</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+8</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Special Challenge Winner</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+7</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">Last Chance Kitchen Winner</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-green-600">+1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Note: The league administrator will update scores after each episode airs.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Season Winner</h2>
              <p>
                The team with the most accumulated points at the end of the season will be crowned the 
                Top Chef Fantasy League Champion. In case of a tie, the team with the most chefs remaining 
                in the finale will win. If still tied, the team with the highest-placed chef in the finale 
                wins.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Additional Rules</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Points are calculated and updated within 24 hours after each episode airs</li>
                <li>Any disputes about scoring should be directed to the league administrator</li>
                <li>Rules may be adjusted between seasons but will remain fixed once a season begins</li>
                <li>Have fun and enjoy the competition!</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;