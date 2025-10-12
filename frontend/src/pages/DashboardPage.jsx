import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, TrendingUp, Eye, Loader } from 'lucide-react';
import { policyAPI } from '../services/api';

const DashboardPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const result = await policyAPI.getAllPolicies();
      if (result.success) {
        setPolicies(result.policies);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Policy Dashboard</h1>
        <p className="text-gray-400">View and manage all uploaded policies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Policies</p>
              <p className="text-3xl font-bold text-primary">{policies.length}</p>
            </div>
            <FileText className="w-12 h-12 text-primary/30" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">This Month</p>
              <p className="text-3xl font-bold text-primary">
                {policies.filter(p => {
                  const uploadDate = new Date(p.upload_date);
                  const now = new Date();
                  return uploadDate.getMonth() === now.getMonth() && 
                         uploadDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-primary/30" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active</p>
              <p className="text-3xl font-bold text-primary">{policies.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary/30" />
          </div>
        </div>
      </div>

      {/* Policies List */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">All Policies</h2>
        
        {policies.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No policies uploaded yet</p>
            <Link to="/" className="btn-primary inline-flex items-center space-x-2">
              <span>Upload First Policy</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <Link
                key={policy.id}
                to={`/policy/${policy.id}`}
                className="block glass-card p-6 card-hover"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-100 mb-2">
                      {policy.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(policy.upload_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <span>•</span>
                      <span className="capitalize">
                        {policy.reading_level?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                      {policy.original_text?.substring(0, 200)}...
                    </p>
                  </div>
                  
                  <div className="ml-6 flex items-center space-x-2 text-primary">
                    <Eye className="w-5 h-5" />
                    <span className="font-medium">View</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;