import React, { useEffect, useState } from 'react';
import { useFile } from '../context/FileContext';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import CreateFolderModal from '../components/CreateFolderModal';
import {
  FolderPlusIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

// ... previous imports and code

const Dashboard = () => {
  const { user, logout } = useAuth();
  const {
    files,
    folders,
    currentFolder,
    loading,
    uploading,
    setCurrentFolder,
    fetchFiles,
    fetchFolders
  } = useFile();

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

  useEffect(() => {
    // Load files and folders when component mounts
    fetchFiles(currentFolder?._id);
    fetchFolders(currentFolder?._id);
  }, [currentFolder, fetchFiles, fetchFolders]);

  const formatStorage = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate storage usage from actual files
  const calculateStorageUsed = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const storageUsed = calculateStorageUsed();
  const storageLimit = user?.storageLimit || 1073741824; // 1GB
  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <CloudIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DriveClone</span>
              
              {/* Breadcrumb */}
              <div className="ml-8 flex items-center space-x-2">
                <button
                  onClick={() => setCurrentFolder(null)}
                  className={`text-gray-600 hover:text-gray-900 ${!currentFolder && 'font-medium text-gray-900'}`}
                >
                  My Drive
                </button>
                {currentFolder && (
                  <>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">{currentFolder.name}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Storage indicator */}
              <div className="hidden md:block">
                <div className="text-sm text-gray-600">
                  {formatStorage(storageUsed)} of {formatStorage(storageLimit)} used
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* User dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none">
                  <UserCircleIcon className="h-8 w-8 text-blue-600" />
                  <span className="hidden md:inline">{user?.firstName} {user?.lastName}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Upload Status Banner */}
        {uploading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-blue-700 font-medium">Uploading files...</span>
            </div>
            <div className="text-sm text-blue-600">
              Please wait
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {currentFolder && (
              <button
                onClick={() => setCurrentFolder(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to My Drive
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {currentFolder ? currentFolder.name : 'My Drive'}
            </h1>
            <div className="text-sm text-gray-500">
              {files.length} files, {folders.length} folders
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FolderPlusIcon className="h-5 w-5 mr-2" />
              New Folder
            </button>
          </div>
        </div>

        {/* Upload area */}
        <div className="mb-8">
          <FileUpload parentFolder={currentFolder?._id} />
        </div>

        {/* Loading state */}
        {loading && files.length === 0 && folders.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your files...</p>
          </div>
        ) : (
          <FileList
            files={files}
            folders={folders}
            onFolderClick={setCurrentFolder}
          />
        )}
      </main>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <CreateFolderModal
          parentFolder={currentFolder?._id}
          onClose={() => setShowCreateFolderModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;