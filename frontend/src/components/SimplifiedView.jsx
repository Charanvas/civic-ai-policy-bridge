import React, { useState } from 'react';
import { FileText, RefreshCw, Copy, Check } from 'lucide-react';
import { policyAPI } from '../services/api';

const SimplifiedView = ({ policy, onUpdate }) => {
  const [selectedLevel, setSelectedLevel] = useState(policy?.reading_level || 'high_school');
  const [simplifying, setSimplifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const readingLevels = {
    elementary: 'Elementary (5th Grade)',
    middle_school: 'Middle School (8th Grade)',
    high_school: 'High School (10th Grade)',
    college: 'College',
    expert: 'Expert/Professional',
  };

  const handleResimplify = async () => {
    setSimplifying(true);
    try {
      const result = await policyAPI.resimplifyPolicy(policy.id, selectedLevel);
      if (result.success) {
        onUpdate({ ...policy, simplified_text: result.simplified_text, reading_level: selectedLevel });
      }
    } catch (error) {
      console.error('Error re-simplifying:', error);
    } finally {
      setSimplifying(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(policy.simplified_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-gray-100">Simplified Version</h3>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-4 py-2 bg-dark-lighter hover:bg-dark-border 
                   text-primary rounded-lg transition-all"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Reading Level Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary mb-3">Reading Level</label>
        <div className="flex items-center space-x-4">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="input-field flex-1"
          >
            {Object.entries(readingLevels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleResimplify}
            disabled={simplifying || selectedLevel === policy.reading_level}
            className="btn-secondary flex items-center space-x-2 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${simplifying ? 'animate-spin' : ''}`} />
            <span>{simplifying ? 'Processing...' : 'Re-simplify'}</span>
          </button>
        </div>
      </div>

      {/* Simplified Text */}
      <div className="bg-dark-lighter rounded-lg p-6 border border-dark-border">
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {policy.simplified_text || 'Processing...'}
          </div>
        </div>
      </div>

      {/* Original Text Toggle */}
      <details className="mt-6">
        <summary className="cursor-pointer text-primary font-medium hover:text-primary-light transition-colors">
          View Original Policy Text
        </summary>
        <div className="mt-4 bg-dark rounded-lg p-6 border border-dark-border">
          <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
            {policy.original_text}
          </div>
        </div>
      </details>
    </div>
  );
};

export default SimplifiedView;