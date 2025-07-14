

'use client';

import React, { useState } from 'react';

const questions = [
  {
    image: '/dishes/biryani.jpg',
    options: ['Pasta', 'Biryani', 'Sushi', 'Tacos'],
    answer: 'Biryani',
  },
  {
    image: '/dishes/sushi.jpg',
    options: ['Burger', 'Sushi', 'Fries', 'Pizza'],
    answer: 'Sushi',
  },
  {
    image: '/dishes/pasta.jpg',
    options: ['Pasta', 'Dosa', 'Cake', 'Nachos'],
    answer: 'Pasta',
  },
  {
    image: '/dishes/pizza.jpg',
    options: ['Idli', 'Pizza', 'Spring Roll', 'Ramen'],
    answer: 'Pizza',
  },
];

const GuessTheDish = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (option: string) => {
    if (selected) return;
    setSelected(option);

    if (option === questions[currentQ].answer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const resetGame = () => {
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🍽️ Guess the Dish</h1>

      {showResult ? (
        <div className="text-center">
          <p className="text-2xl mb-4">🎉 You scored <strong>{score}</strong> out of {questions.length}!</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Play Again
          </button>
        </div>
      ) : (
        <>
          <div className="w-64 h-64 overflow-hidden rounded-lg shadow-lg mb-6">
<img
  src={questions[currentQ].image}
  alt="Dish"
  className={`w-full h-full object-cover transition duration-500 ${selected ? 'blur-0' : 'blur-sm'}`}
/>

          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {questions[currentQ].options.map((option, index) => {
              const isCorrect = option === questions[currentQ].answer;
              const isSelected = selected === option;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={!!selected}
                  className={`px-4 py-3 rounded-lg text-white font-semibold transition
                    ${selected
                      ? isSelected
                        ? isCorrect
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        : isCorrect
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700'}
                  `}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-gray-500">Question {currentQ + 1} of {questions.length}</p>
        </>
      )}
    </div>
  );
};

export default GuessTheDish;



