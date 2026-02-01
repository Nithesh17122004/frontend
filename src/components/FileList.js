import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  DocumentIcon,
  FolderIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  CloudArrowUpIcon // Add this import
} from '@heroicons/react/24/outline';
import { useFile } from '../context/FileContext';

const FileList = ({ files, folders, onFolderClick }) => {
  const { deleteFile, deleteFolder, downloadFile } = useFile();

  const getFileIcon = (type, name) => {
    const extension = name.split('.').pop().toLowerCase();
    
    // Image files
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return PhotoIcon;
    }
    
    // Video files
    if (type.includes('video') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return VideoCameraIcon;
    }
    
    // Audio files
    if (type.includes('audio') || ['mp3', 'wav', 'ogg'].includes(extension)) {
      return MusicalNoteIcon;
    }
    
    // PDF files
    if (type.includes('pdf') || extension === 'pdf') {
      return DocumentTextIcon;
    }
    
    // Office documents
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension)) {
      return PresentationChartBarIcon;
    }
    
    // Default document icon
    return DocumentIcon;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteFile = async (fileId, fileName, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      await deleteFile(fileId);
    }
  };

  const handleDeleteFolder = async (folderId, folderName, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete folder "${folderName}"?`)) {
      await deleteFolder(folderId);
    }
  };

  const handleDownload = async (fileId, fileName, e) => {
    e.stopPropagation();
    await downloadFile(fileId);
  };

  // Function to get file color based on type
  const getFileColor = (type) => {
    if (type.includes('image')) return 'text-green-500';
    if (type.includes('video')) return 'text-purple-500';
    if (type.includes('audio')) return 'text-yellow-500';
    if (type.includes('pdf')) return 'text-red-500';
    return 'text-blue-500';
  };

  return (
    <div className="space-y-6">
      {/* Folders Section */}
      {folders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Folders ({folders.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder._id}
                onClick={() => onFolderClick(folder)}
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FolderIcon className="h-10 w-10 text-yellow-500" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {folder.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteFolder(folder._id, folder.name, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete folder"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Files ({files.length})</h3>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.type, file.name);
                    const fileColor = getFileColor(file.type);
                    
                    return (
                      <tr 
                        key={file._id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileIcon className={`h-8 w-8 ${fileColor} mr-3`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {file.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {file.type.split('/').pop().toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => handleDownload(file._id, file.name, e)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteFile(file._id, file.name, e)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && folders.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <FolderIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your drive is empty</h3>
            <p className="text-gray-500 mb-6">
              Upload files or create folders to get started. You can drag and drop files anywhere on this page.
            </p>
            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100">
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Start by uploading a file
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;