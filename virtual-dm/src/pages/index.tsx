import { useState, useEffect } from 'react';
import { Token } from '../models/Token';

export default function Home() {
  // Available colors for random selection
  const availableColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500',
    'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-amber-500'
  ];

  const [tokens, setTokens] = useState<Token[]>([new Token('Default', 10, 1, true)]); // Default fallback
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate random tokens only on client side
  useEffect(() => {
    const numTokens = Math.floor(Math.random() * 8) + 5; // 5-12 tokens
    const generatedTokens: Token[] = [];
    
    for (let i = 0; i < numTokens; i++) {
      const randomInitiative = Math.floor(Math.random() * 20) + 1; // 1-20 initiative
      const randomHP = Math.floor(Math.random() * 50) + 10; // 10-60 HP
      const randomAlly = Math.random() > 0.5; // Random ally/enemy
      const tokenName = `Token ${i + 1}`;
      
      const token = new Token(tokenName, randomHP, randomInitiative, randomAlly);
      generatedTokens.push(token);
    }
    
    // Sort by initiative in descending order (highest to lowest)
    const sortedTokens = generatedTokens.sort((a, b) => b.initiative - a.initiative);
    setTokens(sortedTokens);
  }, []);

  // Helper function to get color based on token properties
  const getTokenColor = (token: Token, index: number): string => {
    return availableColors[index % availableColors.length];
  };
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? tokens.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === tokens.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - smaller */}
      <div className="w-1/6 flex flex-col items-center bg-gray-100 p-4">
        {/* Top buffer space */}
        <div className="h-16"></div>
        
        {/* Navigation arrows and squares */}
        <div className="flex items-center space-x-2 mb-4">
          <button 
            onClick={goToPrevious}
            className="p-2 hover:bg-gray-200 rounded"
          >
            ←
          </button>
          
          <div className={`w-16 h-16 ${getTokenColor(tokens[currentIndex], currentIndex)} rounded flex items-center justify-center text-white font-bold text-lg`}>
            {tokens[currentIndex].initiative}
          </div>
          
          <button 
            onClick={goToNext}
            className="p-2 hover:bg-gray-200 rounded"
          >
            →
          </button>
        </div>
        
        {/* List of all tokens */}
        <div className="flex flex-col space-y-2 flex-1 overflow-y-auto">
          {tokens.map((token, index) => (
            <div
              key={token.name}
              className={`w-12 h-12 rounded cursor-pointer ${getTokenColor(token, index)} ${
                index === currentIndex 
                  ? 'ring-2 ring-gray-800' 
                  : 'hover:opacity-80'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Right side - larger, subdivided */}
      <div className="w-5/6 flex flex-col">
        {/* Top half - Allies */}
        <div className="flex-1 flex flex-wrap items-center justify-center bg-gray-200 p-4 gap-3 overflow-y-auto">
          {tokens
            .filter(token => token.ally)
            .map((token, index) => (
              <div
                key={`ally-${token.name}`}
                className={`w-28 h-28 ${getTokenColor(token, tokens.indexOf(token))} rounded flex flex-col items-center justify-center text-white font-bold shadow-md ${
                  token.name === tokens[currentIndex].name ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                <div className="text-sm">{token.name}</div>
                <div className="text-lg">{token.initiative}</div>
                <div className="text-sm">{token.currentHP}/{token.totalHP}</div>
              </div>
            ))}
          {tokens.filter(token => token.ally).length === 0 && (
            <p className="text-gray-500 text-lg">No allies</p>
          )}
        </div>
        
        {/* Bottom half - Enemies */}
        <div className="flex-1 flex flex-wrap items-center justify-center bg-gray-300 p-4 gap-3 overflow-y-auto">
          {tokens
            .filter(token => !token.ally)
            .map((token, index) => (
              <div
                key={`enemy-${token.name}`}
                className={`w-28 h-28 ${getTokenColor(token, tokens.indexOf(token))} rounded flex flex-col items-center justify-center text-white font-bold shadow-md ${
                  token.name === tokens[currentIndex].name ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                <div className="text-sm">{token.name}</div>
                <div className="text-lg">{token.initiative}</div>
                <div className="text-sm">{token.currentHP}/{token.totalHP}</div>
              </div>
            ))}
          {tokens.filter(token => !token.ally).length === 0 && (
            <p className="text-gray-500 text-lg">No enemies</p>
          )}
        </div>
      </div>
    </div>
  );
}
