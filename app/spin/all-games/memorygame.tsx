






'use client';

import React, { useEffect, useState } from 'react';

const foodItems = ['🍕', '🍔', '🍣', '🍩', '🍟', '🍦', '🥗', '🍰'];

type CardType = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

const shuffleArray = (array: string[]): CardType[] => {
  const duplicated = [...array, ...array];
  const shuffled = duplicated
    .sort(() => 0.5 - Math.random())
    .map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }));

  return shuffled;
};

const MemoryGame = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [firstCard, setFirstCard] = useState<CardType | null>(null);
  const [secondCard, setSecondCard] = useState<CardType | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    setCards(shuffleArray(foodItems));
  }, []);

  const handleFlip = (card: CardType) => {
    if (disabled || card.flipped || card.matched) return;

    const flippedCard = { ...card, flipped: true };
    const updatedCards = cards.map((c) => (c.id === card.id ? flippedCard : c));
    setCards(updatedCards);

    if (!firstCard) {
      setFirstCard(flippedCard);
    } else if (!secondCard) {
      setSecondCard(flippedCard);
      setDisabled(true);

      if (firstCard.emoji === flippedCard.emoji) {
        const matched = updatedCards.map((c) =>
          c.emoji === flippedCard.emoji ? { ...c, matched: true } : c
        );
        setCards(matched);
        setFirstCard(null);
        setSecondCard(null);
        setDisabled(false);
        setMatchedCount((prev) => prev + 1);
      } else {
        setTimeout(() => {
          const reverted = updatedCards.map((c) =>
            c.id === card.id || c.id === firstCard.id ? { ...c, flipped: false } : c
          );
          setCards(reverted);
          setFirstCard(null);
          setSecondCard(null);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(shuffleArray(foodItems));
    setFirstCard(null);
    setSecondCard(null);
    setMatchedCount(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-100 to-yellow-100 p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">🍽️ Memory Match Game</h1>
      <p className="mb-6 text-gray-700 text-lg">Flip and match all the food tiles!</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleFlip(card)}
            className={`w-20 h-20 flex items-center justify-center text-2xl border-2 rounded-xl shadow-md cursor-pointer transition-transform duration-300 ${
              card.flipped || card.matched ? 'bg-white' : 'bg-gray-300'
            }`}
          >
            {card.flipped || card.matched ? card.emoji : '❓'}
          </div>
        ))}
      </div>

      {matchedCount === foodItems.length && (
        <div className="text-2xl text-green-600 font-semibold mb-4 animate-bounce">
          🎉 You matched all food tiles!
        </div>
      )}

      <button
        onClick={resetGame}
        className="px-6 py-3 bg-green-600 text-white rounded-full shadow hover:bg-green-700"
      >
        🔄 Restart
      </button>
    </div>
  );
};

export default MemoryGame;
