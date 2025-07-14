'use client';

import React, { useState } from 'react';

const rewards = [
  '10% OFF',
  'Free Dessert',
  'Buy 1 Get 1',
  '₹50 Voucher',
  'Free Drink',
  'Try Again',
  'Better Luck Next Time',
  'Big Surprise!',
];

const WhoPaysPage = () => {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState<string | null>(null);

  const spinWheel = () => {
    if (spinning) return;

    const segmentAngle = 360 / rewards.length;
    const randomIndex = Math.floor(Math.random() * rewards.length);

    const fullSpins = Math.floor(Math.random() * 3) + 3; // 3 to 5 full spins
    const offsetWithinSegment = Math.random() * segmentAngle;

    const finalAngle = fullSpins * 360 + randomIndex * segmentAngle + offsetWithinSegment;

    setAngle((prevAngle) => prevAngle + finalAngle);
    setSpinning(true);

    setTimeout(() => {
      setSpinning(false);
      setReward(rewards[randomIndex]);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-100 to-pink-200 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">🎉 Spin & Win 🎁</h1>

      <div className="relative w-[300px] h-[300px] mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-3xl">🔻</div>

        {/* Wheel */}
        <img
          src="/wheel.png"
          alt="Wheel"
          className="absolute w-full h-full top-0 left-0 object-contain"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: 'transform 4s ease-out',
          }}
        />
      </div>

      <button
        onClick={spinWheel}
        disabled={spinning}
        className="px-6 py-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50"
      >
        {spinning ? 'Spinning...' : 'Spin Now'}
      </button>

      {reward && !spinning && (
        <div className="mt-8 text-2xl font-semibold text-purple-700 animate-bounce">
          🎊 You got: <span className="font-bold">{reward}</span> 🎊
        </div>
      )}
    </div>
  );
};

export default WhoPaysPage;

