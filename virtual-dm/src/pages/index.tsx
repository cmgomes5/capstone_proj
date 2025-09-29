import { useState, useEffect } from 'react';

export default function Home() {
  // Available colors for random selection
  const availableColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500',
    'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-amber-500'
  ];

  const [squares, setSquares] = useState([{ id: 1, color: 'bg-gray-500' }]); // Default fallback
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate random squares only on client side
  useEffect(() => {
    const numSquares = Math.floor(Math.random() * 8) + 5; // 5-12 squares
    const generatedSquares = [];
    
    for (let i = 0; i < numSquares; i++) {
      const randomNumber = Math.floor(Math.random() * 100) + 1; // 1-100
      const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
      generatedSquares.push({ id: randomNumber, color: randomColor });
    }
    
    // Sort by id in descending order (highest to lowest)
    const sortedSquares = generatedSquares.sort((a, b) => b.id - a.id);
    setSquares(sortedSquares);
  }, []);
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? squares.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === squares.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - smaller */}
      <div className="w-1/6 flex flex-col items-center justify-center bg-gray-100 p-4">
        {/* Navigation arrows and squares */}
        <div className="flex items-center space-x-2 mb-4">
          <button 
            onClick={goToPrevious}
            className="p-2 hover:bg-gray-200 rounded"
          >
            ←
          </button>
          
          <div className={`w-12 h-12 ${squares[currentIndex].color} rounded flex items-center justify-center text-white font-bold`}>
            {squares[currentIndex].id}
          </div>
          
          <button 
            onClick={goToNext}
            className="p-2 hover:bg-gray-200 rounded"
          >
            →
          </button>
        </div>
        
        {/* List of all squares */}
        <div className="flex flex-col space-y-2 max-h-96 overflow-y-auto">
          {squares.map((square, index) => (
            <div
              key={square.id}
              className={`w-8 h-8 rounded cursor-pointer ${square.color} ${
                index === currentIndex 
                  ? 'ring-2 ring-gray-800' 
                  : 'hover:opacity-80'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Right side - larger, subdivided */}
      <div className="w-5/6 flex flex-col">
        {/* Top half - numbers ≤50 */}
        <div className="flex-1 flex flex-wrap items-center justify-center bg-gray-200 p-4 gap-3 overflow-y-auto">
          {squares
            .filter(square => square.id <= 50)
            .map((square) => (
              <div
                key={`top-${square.id}`}
                className={`w-16 h-16 ${square.color} rounded flex items-center justify-center text-white font-bold shadow-md ${
                  square.id === squares[currentIndex].id ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                {square.id}
              </div>
            ))}
          {squares.filter(square => square.id <= 50).length === 0 && (
            <p className="text-gray-500 text-lg">No squares ≤50</p>
          )}
        </div>
        
        {/* Bottom half - numbers >50 */}
        <div className="flex-1 flex flex-wrap items-center justify-center bg-gray-300 p-4 gap-3 overflow-y-auto">
          {squares
            .filter(square => square.id > 50)
            .map((square) => (
              <div
                key={`bottom-${square.id}`}
                className={`w-16 h-16 ${square.color} rounded flex items-center justify-center text-white font-bold shadow-md ${
                  square.id === squares[currentIndex].id ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                {square.id}
              </div>
            ))}
          {squares.filter(square => square.id > 50).length === 0 && (
            <p className="text-gray-500 text-lg">No squares &gt;50</p>
          )}
        </div>
      </div>
    </div>
  );
}
