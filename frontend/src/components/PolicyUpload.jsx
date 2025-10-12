import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { policyAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const PolicyUpload = () => {
  const [readingLevel, setReadingLevel] = useState('high_school');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedTitle, setExtractedTitle] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadStatus(null);
      setExtractedTitle('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Please select a file' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('reading_level', readingLevel);

      const result = await policyAPI.uploadPolicy(formData);

      if (result.success) {
        setExtractedTitle(result.title);
        setUploadStatus({ 
          type: 'success', 
          message: `Policy uploaded successfully! Title: "${result.title}"` 
        });
        setTimeout(() => {
          navigate(`/policy/${result.policy_id}`);
        }, 2000);
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to upload policy',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Upload Policy Document</h2>
        <p className="text-gray-400">Upload a policy document to make it accessible to citizens</p>
        <p className="text-sm text-primary mt-2">💡 The policy title will be automatically extracted from your document</p>
      </div>

      {/* Reading Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary mb-2">Target Reading Level</label>
        <select
          value={readingLevel}
          onChange={(e) => setReadingLevel(e.target.value)}
          className="input-field"
        >
          <option value="elementary">Elementary (5th Grade)</option>
          <option value="middle_school">Middle School (8th Grade)</option>
          <option value="high_school">High School (10th Grade)</option>
          <option value="college">College</option>
          <option value="expert">Expert/Professional</option>
        </select>
      </div>

      {/* File Upload */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-dark-border hover:border-primary/50 bg-dark-lighter'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {selectedFile ? (
            <>
              <FileText className="w-16 h-16 text-primary" />
              <div>
                <p className="text-lg font-medium text-gray-200">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-primary" />
              <div>
                <p className="text-lg font-medium text-gray-200">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a policy document'}
                </p>
                <p className="text-sm text-gray-400 mt-2">or click to browse</p>
                <p className="text-xs text-gray-500 mt-2">Supports PDF, DOCX, TXT (max 16MB)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div className="mt-6">
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className={`btn-primary w-full flex items-center justify-center space-x-2
            ${(uploading || !selectedFile) && 'opacity-50 cursor-not-allowed'}`}
        >
          {uploading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Processing Document...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload & Process</span>
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
            uploadStatus.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p>{uploadStatus.message}</p>
            {extractedTitle && (
              <p className="text-sm mt-2 opacity-80">Redirecting to policy page...</p>
            )}
          </div>
        </div>
      )}

      {/* Processing Info */}
      {uploading && (
        <div className="mt-6 glass-card p-4">
          <p className="text-sm text-gray-400 mb-3">AI is processing your document:</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Extracting text from document</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <span className="text-sm text-gray-300">Generating policy title</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <span className="text-sm text-gray-300">Simplifying policy language</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              <span className="text-sm text-gray-300">Analyzing demographic impacts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyUpload;