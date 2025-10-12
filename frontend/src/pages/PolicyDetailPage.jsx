import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader } from 'lucide-react';
import { policyAPI } from '../services/api';
import SimplifiedView from '../components/SimplifiedView';
import DemographicImpact from '../components/DemographicImpact';
import FeedbackForm from '../components/FeedbackForm';
import InsightsDashboard from '../components/InsightsDashboard';
import PolicyChatbot from '../components/PolicyChatbot';

const PolicyDetailPage = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('simplified');

  useEffect(() => {
    fetchPolicy();
  }, [id]);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const result = await policyAPI.getPolicyById(id);
      if (result.success) {
        // Parse demographic_impacts if it's a string
        if (typeof result.policy.demographic_impacts === 'string') {
          result.policy.demographic_impacts = JSON.parse(result.policy.demographic_impacts);
        }
        setPolicy(result.policy);
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading policy...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Policy not found</p>
        <Link to="/" className="btn-primary inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'simplified', label: 'Simplified View' },
    { id: 'demographics', label: 'Impact Analysis' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'insights', label: 'Insights' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Policy Info */}
      <div className="glass-card p-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">{policy.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>
              Uploaded: {new Date(policy.upload_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <span>•</span>
          <span className="capitalize">
            Reading Level: {policy.reading_level?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/50'
                  : 'text-gray-400 hover:text-primary hover:bg-dark-lighter'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'simplified' && (
          <SimplifiedView policy={policy} onUpdate={setPolicy} />
        )}
        
        {activeTab === 'demographics' && (
          <DemographicImpact demographics={policy.demographic_impacts} />
        )}
        
        {activeTab === 'feedback' && (
          <FeedbackForm policyId={policy.id} onFeedbackSubmitted={fetchPolicy} />
        )}
        
        {activeTab === 'insights' && (
          <InsightsDashboard policyId={policy.id} policyTitle={policy.title} />
        )}
      </div>

      {/* Chatbot - Always Available */}
      <PolicyChatbot 
        policyId={policy.id} 
        policyText={policy.original_text}
        policyTitle={policy.title}
      />
    </div>
  );
};

export default PolicyDetailPage;