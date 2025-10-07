// React imports
import { useState } from 'react';
// Import our Token model class
import { Token } from '../models/Token';

/**
 * Props interface for the AddTokenModal component
 * Defines the contract for how this modal communicates with its parent
 */
interface AddTokenModalProps {
  isOpen: boolean;           // Controls whether the modal is visible
  onClose: () => void;       // Callback function to close the modal
  onAddToken: (token: Token) => void;  // Callback to add the new token to the parent's state
}

export default function AddTokenModal({ isOpen, onClose, onAddToken }: AddTokenModalProps) {
  // Form state - using strings for input fields to handle empty states
  const [name, setName] = useState('');           // Token name (required)
  const [totalHP, setTotalHP] = useState('');     // Total hit points (required, positive)
  const [initiative, setInitiative] = useState(''); // Initiative roll (required, any integer)
  const [ally, setAlly] = useState(true);         // Token type: true = ally, false = enemy
  const [imageUrl, setImageUrl] = useState('');   // Optional image URL
  const [imageFile, setImageFile] = useState<File | null>(null); // Optional image file

  /**
   * Handles image file selection
   * Converts the selected file to a data URL for display
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Convert file to data URL for preview and storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handles form submission
   * Validates all inputs, creates a new Token instance, and passes it to parent
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Input validation with user feedback
    if (!name.trim()) {
      alert('Name is required');
      return;
    }
    
    // Convert string inputs to numbers and validate
    const hpValue = parseInt(totalHP);
    const initiativeValue = parseInt(initiative);
    
    if (isNaN(hpValue) || hpValue <= 0) {
      alert('Total HP must be a positive number');
      return;
    }
    
    if (isNaN(initiativeValue)) {
      alert('Initiative must be a valid number');
      return;
    }

    // Create new Token instance using our Token class
    // Constructor: Token(name, totalHP, initiative, ally, currentHP?, imageUrl?)
    // currentHP defaults to totalHP if not provided
    const newToken = new Token(name.trim(), hpValue, initiativeValue, ally, undefined, imageUrl || undefined);
    
    // Pass the new token back to the parent component
    onAddToken(newToken);
    
    // Clean up: reset form fields and close modal
    resetForm();
    onClose();
  };

  /**
   * Handles cancel button click
   * Resets form and closes modal without creating a token
   */
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  /**
   * Helper function to reset all form fields to their default values
   */
  const resetForm = () => {
    setName('');
    setTotalHP('');
    setInitiative('');
    setAlly(true); // Default to ally
    setImageUrl('');
    setImageFile(null);
  };

  // Early return: don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    // Full screen overlay to prevent background interaction
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      {/* Modal content container - centered floating white box */}
      <div className="bg-white rounded-lg p-6 w-96 shadow-2xl border border-gray-200">
        {/* Modal header */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Token</h2>
        
        {/* Main form - handles submission via handleSubmit */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Input Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter token name"
              maxLength={50} // Prevent excessively long names
            />
          </div>

          {/* Total HP Input Field */}
          <div>
            <label htmlFor="totalHP" className="block text-sm font-medium text-gray-700 mb-1">
              Total HP
            </label>
            <input
              type="number"
              id="totalHP"
              value={totalHP}
              onChange={(e) => setTotalHP(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter total HP"
              min="1"    // Minimum 1 HP
              max="999"  // Reasonable maximum for D&D
            />
          </div>

          {/* Initiative Input Field */}
          <div>
            <label htmlFor="initiative" className="block text-sm font-medium text-gray-700 mb-1">
              Initiative
            </label>
            <input
              type="number"
              id="initiative"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter initiative"
              min="-10"  // Allow negative initiative (low dexterity)
              max="50"   // Reasonable upper bound for D&D
            />
          </div>

          {/* Ally/Enemy Radio Button Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex space-x-4">
              {/* Ally option */}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tokenType"
                  checked={ally}
                  onChange={() => setAlly(true)}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Ally</span>
              </label>
              {/* Enemy option */}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tokenType"
                  checked={!ally}
                  onChange={() => setAlly(false)}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">Enemy</span>
              </label>
            </div>
          </div>

          {/* Image Upload Field */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Token Image (Optional)
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Image preview */}
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Token preview"
                  className="w-16 h-16 object-cover rounded border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Action Buttons - Cancel and Submit */}
          <div className="flex space-x-3 pt-4">
            {/* Cancel button - resets form and closes modal */}
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            {/* Submit button - validates and creates token */}
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
