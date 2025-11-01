import { useState, useEffect } from 'react';
import { Token } from '../models/Token';

interface EditTokenModalProps {
  isOpen: boolean;
  token: Token | null;
  onClose: () => void;
  onUpdateToken: (updatedToken: Token) => void;
  onDeleteToken: (tokenToDelete: Token) => void;
}

/**
 * EditTokenModal Component
 * 
 * A modal dialog that allows users to edit existing combat tokens:
 * - Name (required text field)
 * - Current HP (required, cannot exceed total HP)
 * - Total HP (required positive integer)
 * - Initiative (required integer, can be negative)
 * - Type (ally or enemy)
 * 
 * Also includes a delete button to remove the token
 */
export default function EditTokenModal({ isOpen, token, onClose, onUpdateToken, onDeleteToken }: EditTokenModalProps) {
  const [name, setName] = useState('');
  const [currentHP, setCurrentHP] = useState('');
  const [totalHP, setTotalHP] = useState('');
  const [initiative, setInitiative] = useState('');
  const [ally, setAlly] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Populate form when token changes
  useEffect(() => {
    if (token) {
      setName(token.name);
      setCurrentHP(token.currentHP.toString());
      setTotalHP(token.totalHP.toString());
      setInitiative(token.initiative.toString());
      setAlly(token.ally);
      setImageUrl(token.imageUrl || '');
    }
  }, [token]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;
    
    // Validation
    if (!name.trim()) {
      alert('Name is required');
      return;
    }
    
    const currentHPValue = parseInt(currentHP);
    const totalHPValue = parseInt(totalHP);
    const initiativeValue = parseInt(initiative);
    
    if (isNaN(totalHPValue) || totalHPValue <= 0) {
      alert('Total HP must be a positive number');
      return;
    }
    
    if (isNaN(currentHPValue) || currentHPValue < 0) {
      alert('Current HP must be a non-negative number');
      return;
    }
    
    // Removed check: Current HP can now exceed Total HP
    
    if (isNaN(initiativeValue)) {
      alert('Initiative must be a valid number');
      return;
    }

    // Update the token with new values
    const updatedToken = new Token(name.trim(), totalHPValue, initiativeValue, ally, currentHPValue, imageUrl || undefined);
    onUpdateToken(updatedToken);
    onClose();
  };

  const handleDelete = () => {
    if (!token) return;
    
    if (confirm(`Are you sure you want to delete "${token.name}"?`)) {
      onDeleteToken(token);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !token) return null;

  return (
    // Full screen overlay to prevent background interaction
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      {/* Modal content container - centered floating white box */}
      <div className="bg-white rounded-lg p-6 w-96 shadow-2xl border border-gray-200">
        {/* Modal header */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Token</h2>
        
        {/* Main form - handles submission via handleSubmit */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Input Field */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter token name"
              maxLength={50}
            />
          </div>

          {/* Current HP Input Field */}
          <div>
            <label htmlFor="edit-currentHP" className="block text-sm font-medium text-gray-700 mb-1">
              Current HP
            </label>
            <input
              type="number"
              id="edit-currentHP"
              value={currentHP}
              onChange={(e) => setCurrentHP(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter current HP"
              min="0"
              max="9999"
            />
          </div>

          {/* Total HP Input Field */}
          <div>
            <label htmlFor="edit-totalHP" className="block text-sm font-medium text-gray-700 mb-1">
              Total HP
            </label>
            <input
              type="number"
              id="edit-totalHP"
              value={totalHP}
              onChange={(e) => setTotalHP(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter total HP"
              min="1"
              max="9999"
            />
          </div>

          {/* Initiative Input Field */}
          <div>
            <label htmlFor="edit-initiative" className="block text-sm font-medium text-gray-700 mb-1">
              Initiative
            </label>
            <input
              type="number"
              id="edit-initiative"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter initiative"
              min="-10"
              max="50"
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
                  name="editTokenType"
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
                  name="editTokenType"
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
            <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 mb-2">
              Token Image (Optional)
            </label>
            <input
              type="file"
              id="edit-image"
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

          {/* Action Buttons - Delete, Cancel, and Update */}
          <div className="flex space-x-3 pt-4">
            {/* Delete button - removes token */}
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
            {/* Cancel button - closes modal without changes */}
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            {/* Update button - saves changes */}
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
