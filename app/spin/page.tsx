// 'use client';
// import React from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";

// const games = [
//   { name: "Memory Game", path: "/spin/all-games/memorygame" },
//   { name: "Guess The Dish", path: "/spin/all-games/guessthedish" },
//   { name: "Who Pays", path: "/spin/all-games/whopayspage" },
//   { name: "Draw Your Dish", path: "/spin/all-games/drawyourdish" },
//   { name: "Bill Pay", path: "/spin/all-games/billpay" }
// ];

// export default function SpinGamesPage() {
//   const router = useRouter();
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-br from-orange-50 to-red-50">
//       <h1 className="text-4xl font-extrabold mb-4 text-orange-600 drop-shadow">Spin Zone: Choose a Game!</h1>
//       <p className="mb-8 text-lg text-gray-700">Welcome to the fun zone! Pick a game below and challenge your friends or yourself. Each game is a unique experience!</p>
//       <div className="flex flex-col gap-4 w-full max-w-xs">
//         {games.map((game) => (
//           <Button key={game.path} onClick={() => router.push(game.path)} className="w-full text-lg py-6 shadow-lg hover:scale-105 transition-transform">
//             {game.name}
//           </Button>
//         ))}
//       </div>
//       <div className="mt-10 flex flex-col items-center gap-2 text-sm text-gray-500">
//         <span>More games coming soon!</span>
//         <span className="italic">Enjoy and have fun 🎉</span>
//       </div>
//     </div>
//   );
// }




"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Gamepad2, Star, Smile, Wand2 } from "lucide-react";

const games = [
  { name: "Memory Game", path: "/spin/all-games/memorygame", icon: <Sparkles className="h-5 w-5 text-yellow-500" /> },
  { name: "Guess The Dish", path: "/spin/all-games/guessthedish", icon: <Star className="h-5 w-5 text-pink-500" /> },
  { name: "Who Pays", path: "/spin/all-games/whopayspage", icon: <Gamepad2 className="h-5 w-5 text-blue-500" /> },
  { name: "Draw Your Dish", path: "/spin/all-games/drawyourdish", icon: <Wand2 className="h-5 w-5 text-purple-500" /> },
  { name: "Bill Pay", path: "/spin/all-games/billpay", icon: <Smile className="h-5 w-5 text-green-500" /> }
];

export default function SpinGamesPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4 py-10">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-orange-200 rounded-3xl p-8 shadow-2xl max-w-xl w-full flex flex-col items-center gap-6 transition-all duration-300">
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 drop-shadow-sm text-center">
          🎮 Spin Zone
        </h1>
        <p className="text-center text-gray-700 text-lg max-w-md">
          Ready to spice up your dining experience? Pick a game and let the fun begin!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
          {games.map((game) => (
            <button
              key={game.path}
              onClick={() => router.push(game.path)}
              className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-transform duration-300 ease-in-out text-gray-800 font-medium"
            >
              <span className="shrink-0">{game.icon}</span>
              <span className="truncate">{game.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-sm text-center text-gray-500">
          <p>✨ More exciting games coming soon!</p>
          <p className="italic">Stay tuned & have fun 🎉</p>
        </div>
      </div>
    </div>
  );
}
