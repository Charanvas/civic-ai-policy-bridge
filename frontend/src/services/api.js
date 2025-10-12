import axios from 'axios';

// Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

export const policyAPI = {
  // Get all policies
  getAllPolicies: async () => {
    const response = await api.get('/policies');
    return response.data;
  },

  // Get policy by ID
  getPolicyById: async (policyId) => {
    const response = await api.get(`/policies/${policyId}`);
    return response.data;
  },

  // Upload new policy
  uploadPolicy: async (formData) => {
    const response = await api.post('/policies/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for file upload
    });
    return response.data;
  },

  // Re-simplify policy
  resimplifyPolicy: async (policyId, readingLevel) => {
    const response = await api.post(`/policies/${policyId}/simplify`, {
      reading_level: readingLevel,
    });
    return response.data;
  },

  // Chat with policy
  chatWithPolicy: async (policyId, question) => {
    const response = await api.post(`/policies/${policyId}/chat`, {
      question: question,
    }, {
      timeout: 60000, // 1 minute for AI response
    });
    return response.data;
  },
};

export const feedbackAPI = {
  // Get feedback for policy
  getFeedback: async (policyId) => {
    const response = await api.get(`/policies/${policyId}/feedback`);
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (policyId, feedbackData) => {
    const response = await api.post(`/policies/${policyId}/feedback`, feedbackData);
    return response.data;
  },

  // Get insights
  getInsights: async (policyId) => {
    const response = await api.get(`/policies/${policyId}/insights`);
    return response.data;
  },
};

export default api;