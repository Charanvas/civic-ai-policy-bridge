import React, { useState } from 'react';
import { MessageSquare, Send, Loader } from 'lucide-react';
import { feedbackAPI } from '../services/api';

const FeedbackForm = ({ policyId, onFeedbackSubmitted }) => {
  const [feedbackType, setFeedbackType] = useState('general');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const feedbackTypes = [
    { value: 'support', label: '👍 Support' },
    { value: 'concern', label: '⚠️ Concern' },
    { value: 'suggestion', label: '💡 Suggestion' },
    { value: 'question', label: '❓ Question' },
    { value: 'general', label: '💬 General' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your feedback' });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await feedbackAPI.submitFeedback(policyId, {
        feedback_type: feedbackType,
        feedback_text: feedbackText,
      });

      if (result.success) {
        setSubmitStatus({ type: 'success', message: 'Feedback submitted successfully!' });
        setFeedbackText('');
        setFeedbackType('general');
        
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }

        setTimeout(() => setSubmitStatus(null), 3000);
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to submit feedback',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold text-gray-100">Share Your Feedback</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Feedback Type
          </label>
          <div className="grid grid-cols-5 gap-2">
            {feedbackTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFeedbackType(type.value)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  feedbackType === type.value
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'bg-dark-lighter text-gray-400 hover:bg-dark-border hover:text-primary'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Text */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Your Feedback
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share your thoughts, concerns, or suggestions about this policy..."
            rows="6"
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            {feedbackText.length} characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !feedbackText.trim()}
          className={`btn-primary w-full flex items-center justify-center space-x-2
            ${(submitting || !feedbackText.trim()) && 'opacity-50 cursor-not-allowed'}`}
        >
          {submitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Feedback</span>
            </>
          )}
        </button>

        {/* Status Message */}
        {submitStatus && (
          <div
            className={`p-4 rounded-lg text-sm ${
              submitStatus.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default FeedbackForm;