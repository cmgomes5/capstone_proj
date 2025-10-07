import { useState, useEffect } from 'react';
import { Token } from '../models/Token';
import AddTokenModal from '../components/AddTokenModal';
import EditTokenModal from '../components/EditTokenModal';
import TokenDisplay from '../components/TokenDisplay';

export default function Home() {
  // Available colors for random selection
  const availableColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500',
    'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-amber-500'
  ];

  const [tokens, setTokens] = useState<Token[]>([]); // Start with empty token list
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tokenToEdit, setTokenToEdit] = useState<Token | null>(null);

  // Helper function to get color based on token properties
  const getTokenColor = (token: Token, index: number): string => {
    return availableColors[index % availableColors.length];
  };

  // Function to add a new token
  const handleAddToken = (newToken: Token) => {
    setTokens(prevTokens => {
      const updatedTokens = [...prevTokens, newToken];
      // Sort by initiative in descending order (highest to lowest)
      return updatedTokens.sort((a, b) => b.initiative - a.initiative);
    });
  };

  // Function to handle token click for editing
  const handleTokenClick = (token: Token) => {
    setTokenToEdit(token);
    setIsEditModalOpen(true);
  };

  // Function to update an existing token
  const handleUpdateToken = (updatedToken: Token) => {
    setTokens(prevTokens => {
      const updatedTokens = prevTokens.map(token => 
        token.name === tokenToEdit?.name ? updatedToken : token
      );
      // Sort by initiative in descending order (highest to lowest)
      return updatedTokens.sort((a, b) => b.initiative - a.initiative);
    });
    // Update current index if needed
    const newIndex = tokens.findIndex(token => token.name === updatedToken.name);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  };

  // Function to delete a token
  const handleDeleteToken = (tokenToDelete: Token) => {
    setTokens(prevTokens => {
      const filteredTokens = prevTokens.filter(token => token.name !== tokenToDelete.name);
      // Adjust current index if necessary
      if (currentIndex >= filteredTokens.length && filteredTokens.length > 0) {
        setCurrentIndex(filteredTokens.length - 1);
      } else if (filteredTokens.length === 0) {
        setCurrentIndex(0);
      }
      return filteredTokens;
    });
  };
  
  const goToPrevious = () => {
    if (tokens.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? tokens.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    if (tokens.length === 0) return;
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
        {tokens.length > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center mb-4 h-16">
            <p className="text-gray-500 text-sm">No tokens yet</p>
          </div>
        )}
        
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
      
      {/* Right side - Token Display Component */}
      <TokenDisplay 
        tokens={tokens}
        currentToken={tokens.length > 0 ? tokens[currentIndex] : null}
        getTokenColor={getTokenColor}
        onTokenClick={handleTokenClick}
      />

      {/* Add Token Button - Bottom Right */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold transition-colors z-40"
        title="Add New Token"
      >
        +
      </button>

      {/* Add Token Modal */}
      <AddTokenModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddToken={handleAddToken}
      />

      {/* Edit Token Modal */}
      <EditTokenModal
        isOpen={isEditModalOpen}
        token={tokenToEdit}
        onClose={() => {
          setIsEditModalOpen(false);
          setTokenToEdit(null);
        }}
        onUpdateToken={handleUpdateToken}
        onDeleteToken={handleDeleteToken}
      />
    </div>
  );
}
