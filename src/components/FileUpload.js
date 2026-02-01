import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useFile } from '../context/FileContext';
import toast from 'react-hot-toast';

const FileUpload = ({ parentFolder = null }) => {
  const { uploadFile, uploading } = useFile();
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setDragOver(false);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`"${file.name}" is too large (max 100MB)`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`"${file.name}" has an unsupported file type`);
          }
        });
      });
    }
    
    // Upload accepted files
    if (acceptedFiles.length > 0) {
      for (const file of acceptedFiles) {
        try {
          await uploadFile(file, parentFolder);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
      
      if (acceptedFiles.length === 1) {
        toast.success(`Uploaded "${acceptedFiles[0].name}" successfully!`);
      } else {
        toast.success(`Uploaded ${acceptedFiles.length} files successfully!`);
      }
    }
  }, [uploadFile, parentFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-3 border-dashed rounded-xl p-8 text-center cursor-pointer 
        transition-all duration-300 ease-in-out
        ${dragOver || isDragActive
          ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
        ${uploading ? 'opacity-70' : ''}
      `}
    >
      <input {...getInputProps()} disabled={uploading} />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`
          p-4 rounded-full transition-all duration-300
          ${dragOver || isDragActive ? 'bg-blue-100 scale-110' : 'bg-gray-100'}
        `}>
          <CloudArrowUpIcon className={`
            h-12 w-12 transition-colors duration-300
            ${dragOver || isDragActive ? 'text-blue-600' : 'text-gray-400'}
          `} />
        </div>
        
        <div className="space-y-2">
          {dragOver || isDragActive ? (
            <>
              <p className="text-xl font-semibold text-blue-600 animate-pulse">
                Drop files here to upload!
              </p>
              <p className="text-gray-500">Release to start uploading</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-gray-900">
                Drag & drop files here
              </p>
              <p className="text-gray-600">
                or <span className="font-medium text-blue-600">browse</span> to select files
              </p>
            </>
          )}
        </div>
        
        <div className="text-sm text-gray-500 space-y-1">
          <p>Supports: Images, PDF, Documents, Spreadsheets, Presentations</p>
          <p>Maximum file size: 100MB per file</p>
        </div>
        
        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-sm text-blue-600 font-medium animate-pulse">
              Uploading your files...
            </p>
          </div>
        )}
        
        {!uploading && (dragOver || isDragActive) && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Release mouse to upload files
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;