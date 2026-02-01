import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FileContext = createContext({});

export const useFile = () => useContext(FileContext);

export const FileProvider = ({ children }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user data when user changes
  useEffect(() => {
    if (!user) {
      setFiles([]);
      setFolders([]);
      return;
    }

    const loadUserData = () => {
      try {
        const userFilesKey = `driveclone_files_${user.id}`;
        const userFoldersKey = `driveclone_folders_${user.id}`;
        
        const savedFiles = localStorage.getItem(userFilesKey);
        const savedFolders = localStorage.getItem(userFoldersKey);
        
        let loadedFiles = [];
        let loadedFolders = [];
        
        if (savedFiles) {
          loadedFiles = JSON.parse(savedFiles);
        }
        
        if (savedFolders) {
          loadedFolders = JSON.parse(savedFolders);
        }
        
        // If no data exists, create sample data
        if (loadedFiles.length === 0 && loadedFolders.length === 0) {
          const now = Date.now();
          
          // Sample files
          loadedFiles = [
            {
              _id: `file_${user.id}_sample_1`,
              name: 'Welcome to DriveClone.pdf',
              size: 1.2 * 1024 * 1024,
              type: 'application/pdf',
              createdAt: new Date(now).toISOString(),
              url: '#',
              parentFolder: null,
              userId: user.id,
              isSample: true
            },
            {
              _id: `file_${user.id}_sample_2`,
              name: 'Getting Started.jpg',
              size: 2.5 * 1024 * 1024,
              type: 'image/jpeg',
              createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
              url: '#',
              parentFolder: null,
              userId: user.id,
              isSample: true
            }
          ];
          
          // Sample folders
          loadedFolders = [
            {
              _id: `folder_${user.id}_sample_1`,
              name: 'My Documents',
              createdAt: new Date(now).toISOString(),
              path: '/My Documents',
              parentFolder: null,
              userId: user.id,
              isSample: true
            },
            {
              _id: `folder_${user.id}_sample_2`,
              name: 'Personal',
              createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
              path: '/Personal',
              parentFolder: null,
              userId: user.id,
              isSample: true
            }
          ];
          
          // Save sample data
          localStorage.setItem(userFilesKey, JSON.stringify(loadedFiles));
          localStorage.setItem(userFoldersKey, JSON.stringify(loadedFolders));
        }
        
        setFiles(loadedFiles);
        setFolders(loadedFolders);
        
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

  // Save data when it changes
  useEffect(() => {
    if (user) {
      const saveData = () => {
        try {
          const userFilesKey = `driveclone_files_${user.id}`;
          const userFoldersKey = `driveclone_folders_${user.id}`;
          
          // Convert blob URLs to markers before saving
          const filesToSave = files.map(file => ({
            ...file,
            url: file.url.startsWith('blob:') ? '#blob' : file.url
          }));
          
          localStorage.setItem(userFilesKey, JSON.stringify(filesToSave));
          localStorage.setItem(userFoldersKey, JSON.stringify(folders));
          
        } catch (error) {
          console.error('Error saving data:', error);
        }
      };

      // Debounce save to prevent too many writes
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [files, folders, user]);

  const getFilesForCurrentFolder = () => {
    if (!currentFolder) {
      return files.filter(file => !file.parentFolder);
    }
    return files.filter(file => file.parentFolder === currentFolder._id);
  };

  const getFoldersForCurrentFolder = () => {
    if (!currentFolder) {
      return folders.filter(folder => !folder.parentFolder);
    }
    return folders.filter(folder => folder.parentFolder === currentFolder._id);
  };

  const uploadFile = async (file, parentFolder = null) => {
    if (!user) {
      toast.error('Please login to upload files');
      return { success: false };
    }

    try {
      setUploading(true);
      
      // Validate
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`File too large (max 100MB)`);
        return { success: false };
      }
      
      // Create blob URL for immediate use
      const blobUrl = URL.createObjectURL(file);
      
      // Create file object
      const newFile = {
        _id: `file_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        createdAt: new Date().toISOString(),
        url: blobUrl,
        parentFolder,
        userId: user.id,
        isSample: false
      };
      
      // Add to state
      setFiles(prev => [newFile, ...prev]);
      
      toast.success(
        <div>
          <div className="font-medium">✓ Upload Successful!</div>
          <div className="text-sm opacity-90">{file.name}</div>
          <div className="text-xs opacity-75">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
        </div>
      );
      
      return { success: true, data: newFile };
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      return { success: false };
    } finally {
      setUploading(false);
    }
  };

  const createFolder = async (name, parentFolder = null) => {
    if (!user) {
      toast.error('Please login to create folders');
      return { success: false };
    }

    try {
      setLoading(true);
      
      if (!name.trim()) {
        toast.error('Please enter a folder name');
        return { success: false };
      }
      
      // Check for duplicate folder name in same location
      const existingFolder = folders.find(folder => 
        folder.name.toLowerCase() === name.toLowerCase() && 
        folder.parentFolder === parentFolder &&
        !folder.isSample
      );
      
      if (existingFolder) {
        toast.error(`Folder "${name}" already exists here`);
        return { success: false };
      }
      
      const newFolder = {
        _id: `folder_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        createdAt: new Date().toISOString(),
        path: parentFolder ? `/${parentFolder}/${name}` : `/${name}`,
        parentFolder,
        userId: user.id,
        isSample: false
      };
      
      setFolders(prev => [newFolder, ...prev]);
      
      toast.success(`Folder "${name}" created successfully`);
      return { success: true, data: newFolder };
      
    } catch (error) {
      console.error('Create folder error:', error);
      toast.error('Failed to create folder');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    if (!user) {
      toast.error('Please login to delete files');
      return { success: false };
    }

    try {
      const fileToDelete = files.find(f => f._id === fileId);
      if (!fileToDelete) {
        toast.error('File not found');
        return { success: false };
      }
      
      // Check ownership
      if (fileToDelete.userId !== user.id) {
        toast.error('Cannot delete other user\'s files');
        return { success: false };
      }
      
      // Confirm deletion for non-sample files
      if (!fileToDelete.isSample) {
        if (!window.confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) {
          return { success: false };
        }
      }
      
      setFiles(prev => prev.filter(f => f._id !== fileId));
      
      // Clean up blob URL
      if (fileToDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(fileToDelete.url);
      }
      
      if (!fileToDelete.isSample) {
        toast.success(`"${fileToDelete.name}" has been deleted`);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
      return { success: false };
    }
  };

  const deleteFolder = async (folderId) => {
    if (!user) {
      toast.error('Please login to delete folders');
      return { success: false };
    }

    try {
      const folderToDelete = folders.find(f => f._id === folderId);
      if (!folderToDelete) {
        toast.error('Folder not found');
        return { success: false };
      }
      
      // Check ownership
      if (folderToDelete.userId !== user.id) {
        toast.error('Cannot delete other user\'s folders');
        return { success: false };
      }
      
      // Don't allow deleting sample folders
      if (folderToDelete.isSample) {
        toast.error('Cannot delete sample folders');
        return { success: false };
      }
      
      // Check if folder has files
      const folderFiles = files.filter(f => f.parentFolder === folderId);
      const hasFiles = folderFiles.length > 0;
      
      let confirmMessage = `Are you sure you want to delete folder "${folderToDelete.name}"?`;
      if (hasFiles) {
        confirmMessage += `\nThis folder contains ${folderFiles.length} file(s) that will also be deleted.`;
      }
      
      if (!window.confirm(confirmMessage)) {
        return { success: false };
      }
      
      // Delete folder and its files
      setFolders(prev => prev.filter(f => f._id !== folderId));
      setFiles(prev => prev.filter(f => f.parentFolder !== folderId));
      
      // Clean up blob URLs of deleted files
      folderFiles.forEach(file => {
        if (file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
      
      toast.success(`Folder "${folderToDelete.name}" has been deleted`);
      return { success: true };
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
      return { success: false };
    }
  };

  const downloadFile = async (fileId) => {
    if (!user) {
      toast.error('Please login to download files');
      return { success: false };
    }

    try {
      const file = files.find(f => f._id === fileId);
      if (!file) {
        toast.error('File not found');
        return { success: false };
      }
      
      // Check ownership
      if (file.userId !== user.id) {
        toast.error('Cannot download other user\'s files');
        return { success: false };
      }
      
      // For uploaded files with blob URL
      if (file.url.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } 
      // For stored files
      else {
        // Create content for sample files
        const content = file.isSample 
          ? `Sample file: ${file.name}\nCreated: ${file.createdAt}\nSize: ${file.size} bytes`
          : `Your file: ${file.name}\nUploaded: ${file.createdAt}\nSize: ${file.size} bytes`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name + (file.isSample ? '_sample.txt' : '.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      toast.success(`Downloading "${file.name}"...`);
      return { success: true };
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
      return { success: false };
    }
  };

  const fetchFiles = async (folderId = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredFiles = folderId 
          ? files.filter(file => file.parentFolder === folderId)
          : files.filter(file => !file.parentFolder);
        resolve(filteredFiles);
      }, 100);
    });
  };

  const fetchFolders = async (parentId = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredFolders = parentId
          ? folders.filter(folder => folder.parentFolder === parentId)
          : folders.filter(folder => !folder.parentFolder);
        resolve(filteredFolders);
      }, 100);
    });
  };

  const clearUserData = () => {
    if (user && window.confirm('Delete ALL your files and folders? This cannot be undone.')) {
      // Keep sample data
      const sampleFiles = files.filter(f => f.isSample);
      const sampleFolders = folders.filter(f => f.isSample);
      
      setFiles(sampleFiles);
      setFolders(sampleFolders);
      
      const userFilesKey = `driveclone_files_${user.id}`;
      const userFoldersKey = `driveclone_folders_${user.id}`;
      
      // Save only sample data
      localStorage.setItem(userFilesKey, JSON.stringify(sampleFiles));
      localStorage.setItem(userFoldersKey, JSON.stringify(sampleFolders));
      
      toast.success('All your uploaded files and folders have been cleared');
    }
  };

  const value = {
    files: getFilesForCurrentFolder(),
    folders: getFoldersForCurrentFolder(),
    allFiles: files,
    currentFolder,
    loading,
    uploading,
    setCurrentFolder,
    uploadFile,
    createFolder,
    deleteFile,
    deleteFolder,
    downloadFile,
    fetchFiles,
    fetchFolders,
    clearUserData
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};