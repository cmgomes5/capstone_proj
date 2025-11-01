import { useState, useEffect } from 'react';
import { Token } from '../models/Token';

interface HPEditModalProps {
  isOpen: boolean;
  token: Token | null;
  tokenIndex: number;
  onClose: () => void;
  onUpdateHP: (token: Token, newHP: number) => void;
  onOpenFullEdit: (token: Token) => void;
  getTokenColor: (token: Token, index: number) => string;
}

/**
 * HPEditModal Component
 * 
 * An intermediate modal that appears when clicking on a token.
 * Provides quick HP editing functionality with:
 * - Visual HP bar showing current/total HP
 * - Input field to quickly adjust current HP
 * - Button to open the full edit modal
 */
export default function HPEditModal({ isOpen, token, tokenIndex, onClose, onUpdateHP, onOpenFullEdit, getTokenColor }: HPEditModalProps) {
  const [currentHP, setCurrentHP] = useState('');
  const [originalHP, setOriginalHP] = useState('');

  // Update local state when token changes
  useEffect(() => {
    if (token) {
      const hpString = token.currentHP.toString();
      setCurrentHP(hpString);
      setOriginalHP(hpString);
    }
  }, [token]);

  if (!isOpen || !token) return null;

  const handleHPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for editing, or valid numbers
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setCurrentHP(value);
      // No auto-save - changes are only visual until 'Okay' is clicked
    }
  };

  const playAudio = (audioFile: string) => {
    try {
      const audio = new Audio(`/audio/${audioFile}`);
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(error => {
        console.warn(`Could not play audio file ${audioFile}:`, error);
      });
    } catch (error) {
      console.warn(`Error loading audio file ${audioFile}:`, error);
    }
  };

  const handleSave = () => {
    const newHP = parseInt(currentHP);
    const oldHP = parseInt(originalHP);
    
    if (!isNaN(newHP) && newHP >= 0) {
      // Play appropriate audio based on HP change
      if (newHP > oldHP) {
        playAudio('heal.mp3');
      } else if (newHP < oldHP) {
        playAudio('damage.mp3');
      }
      // No audio if HP stays the same
      
      onUpdateHP(token, newHP);
    }
    onClose();
  };

  const handleCancel = () => {
    // Reset to original HP without saving
    setCurrentHP(originalHP);
    onClose();
  };

  const handleFullEdit = () => {
    // Save current changes before opening full edit
    const newHP = parseInt(currentHP);
    if (!isNaN(newHP) && newHP >= 0) {
      onUpdateHP(token, newHP);
    }
    onClose();
    onOpenFullEdit(token);
  };

  // Handle keyboard shortcuts for HP adjustment
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'ArrowUp' || e.key === '+') {
      e.preventDefault();
      const newHP = displayHP + 1;
      setCurrentHP(newHP.toString());
    } else if (e.key === 'ArrowDown' || e.key === '-') {
      e.preventDefault();
      const newHP = Math.max(0, displayHP - 1);
      setCurrentHP(newHP.toString());
    }
  };

  // Calculate HP percentage for the bar using current input value
  const displayHP = currentHP === '' ? 0 : parseInt(currentHP) || 0;
  const hpPercentage = token.totalHP > 0 ? (displayHP / token.totalHP) * 100 : 0;
  
  // Determine HP bar color based on percentage
  const getHPBarColor = () => {
    if (hpPercentage > 60) return 'bg-green-500';
    if (hpPercentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 shadow-xl pointer-events-auto"
        onKeyDown={handleKeyPress}
        tabIndex={0}
      >
        {/* Header with Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Centered Token Info */}
        <div className="flex flex-col items-center mb-6">
          {/* Token Picture Circle */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg relative overflow-hidden mb-3 shadow-lg ${
            !token.imageUrl ? getTokenColor(token, tokenIndex) : 'bg-gray-200'
          }`}>
            {/* Background image if available */}
            {token.imageUrl && (
              <img
                src={token.imageUrl}
                alt={token.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* Initiative number positioned in top right */}
            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 ${
              token.imageUrl ? 'bg-black bg-opacity-90 text-white' : 'bg-white bg-opacity-20 text-white'
            }`}>
              {token.initiative}
            </div>
          </div>
          
          {/* Centered Token Name */}
          <h2 className="text-xl font-bold text-gray-800 text-center">{token.name}</h2>
        </div>

        {/* HP Bar with Plus/Minus Controls */}
        <div className="mb-4">
          <div className="flex justify-center mb-2">
            <span className="text-sm font-medium text-gray-700">Health Points</span>
          </div>
          
          {/* HP Bar with side buttons */}
          <div className="flex items-center gap-2">
            {/* Minus Button */}
            <button
              onClick={() => {
                const newHP = Math.max(0, displayHP - 1);
                setCurrentHP(newHP.toString());
              }}
              className="w-10 h-10 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors"
              disabled={displayHP <= 0}
            >
              −
            </button>
            
            {/* HP Bar - matching main page style */}
            <div className="flex-1 h-8 bg-gray-300 border border-black relative overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                {displayHP}/{token.totalHP}
              </div>
            </div>
            
            {/* Plus Button */}
            <button
              onClick={() => {
                const newHP = displayHP + 1;
                setCurrentHP(newHP.toString());
              }}
              className="w-10 h-10 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Direct HP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set HP Directly
          </label>
          <input
            type="number"
            value={currentHP}
            onChange={handleHPChange}
            onKeyDown={handleKeyPress}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter HP value"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleFullEdit}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
