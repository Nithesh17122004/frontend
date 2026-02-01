import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFile } from '../context/FileContext';
import toast from 'react-hot-toast';

const CreateFolderModal = ({ parentFolder, onClose }) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const { createFolder } = useFile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    
    setLoading(true);
    
    const result = await createFolder(folderName.trim(), parentFolder);
    
    if (result.success) {
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Create New Folder</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="input-field"
              placeholder="Enter folder name"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;