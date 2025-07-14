












'use client';

import React, { useState } from 'react';

const getRandomName = (names: string[]) => {
  const index = Math.floor(Math.random() * names.length);
  return names[index];
};

const WhoPaysPage = () => {
  const [namesInput, setNamesInput] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [chosenOne, setChosenOne] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const startRoulette = () => {
    const nameArray = namesInput
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name !== '');

    if (nameArray.length < 2) {
      alert('Please enter at least 2 names.');
      return;
    }

    setNames(nameArray);
    setChosenOne(null);
    setSpinning(true);

    // Simulate spinning delay
    setTimeout(() => {
      const selected = getRandomName(nameArray);
      setChosenOne(selected);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-200 p-6 text-center">
      <h1 className="text-4xl font-bold mb-6 text-rose-700">🍽️ Who Pays the Bill? 🎲</h1>

      <p className="mb-4 text-gray-700">Enter names separated by commas (e.g. Rohan, Meena, Alex)</p>
      <input
        type="text"
        value={namesInput}
        onChange={(e) => setNamesInput(e.target.value)}
        className="w-full max-w-md px-4 py-2 border rounded-lg mb-4 text-lg shadow-sm"
        placeholder="Enter names here..."
      />

      <button
        onClick={startRoulette}
        disabled={spinning}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition disabled:opacity-50"
      >
        {spinning ? 'Spinning...' : 'Spin to Choose!'}
      </button>

      <div className="mt-10">
        {spinning && (
          <div className="text-2xl font-medium text-gray-600 animate-pulse">
            🌀 Spinning the roulette...
          </div>
        )}

        {chosenOne && !spinning && (
          <div className="mt-6 text-3xl font-bold text-green-700 animate-bounce">
            🧾 Uh-oh... <span className="text-rose-800">{chosenOne}</span> is paying the bill! 💸
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500">Just for fun — don’t actually fight over it! 😅</div>
    </div>
  );
};

export default WhoPaysPage;


