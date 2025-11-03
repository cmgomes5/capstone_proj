import React from 'react';

interface AddTokenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onLoadExisting: () => void;
}

/**
 * AddTokenMenu Component
 * 
 * An intermediate menu that appears when clicking the plus button.
 * Provides options to create a new token or load an existing one.
 */
export default function AddTokenMenu({ isOpen, onClose, onCreateNew, onLoadExisting }: AddTokenMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4 shadow-xl pointer-events-auto">
        {/* Header with Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add Token</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-3">
          {/* Create New Option */}
          <button
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold">
              +
            </div>
            <div>
              <div className="font-medium">Create New</div>
              <div className="text-sm text-blue-100">Create a brand new token</div>
            </div>
          </button>

          {/* Load Existing Option */}
          <button
            onClick={() => {
              onClose();
              onLoadExisting();
            }}
            className="w-full px-6 py-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-xl font-bold">
              📁
            </div>
            <div>
              <div className="font-medium">Load Existing</div>
              <div className="text-sm text-gray-100">Load a saved token</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
