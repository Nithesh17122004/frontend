import api from './api';

export const fileService = {
  uploadFile: async (file, parentFolder = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentFolder) {
      formData.append('parentFolder', parentFolder);
    }
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFiles: async (folderId = null) => {
    const url = folderId ? `/files?folder=${folderId}` : '/files';
    const response = await api.get(url);
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}/download`);
    return response.data;
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  createFolder: async (name, parentFolder = null) => {
    const response = await api.post('/folders', { name, parentFolder });
    return response.data;
  },

  getFolders: async (parentId = null) => {
    const url = parentId ? `/folders?parent=${parentId}` : '/folders';
    const response = await api.get(url);
    return response.data;
  },

  getFolderContents: async (folderId) => {
    const response = await api.get(`/folders/${folderId}/contents`);
    return response.data;
  },

  deleteFolder: async (folderId) => {
    const response = await api.delete(`/folders/${folderId}`);
    return response.data;
  }
};