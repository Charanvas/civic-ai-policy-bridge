import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Lightbulb, RefreshCw, MessageSquare, ThumbsUp, ThumbsDown, Minus, Download, FileText } from 'lucide-react';
import { feedbackAPI } from '../services/api';

const InsightsDashboard = ({ policyId, policyTitle }) => {
  const [insights, setInsights] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [insightsResult, feedbackResult] = await Promise.all([
        feedbackAPI.getInsights(policyId),
        feedbackAPI.getFeedback(policyId),
      ]);

      if (insightsResult.success) {
        setInsights(insightsResult.insights);
      } else {
        setError(insightsResult.error || 'Failed to fetch insights');
      }

      if (feedbackResult.success) {
        setFeedbacks(feedbackResult.feedback);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [policyId]);

  // Download Insights as PDF/JSON
  const downloadInsights = (format = 'json') => {
    setDownloading(true);
    
    try {
      if (format === 'json') {
        // Download as JSON
        const reportData = {
          policy_title: policyTitle || 'Policy Document',
          generated_date: new Date().toISOString(),
          total_feedback: feedbacks.length,
          sentiment_distribution: insights.sentiment_distribution,
          overall_sentiment: insights.overall_sentiment,
          top_concerns: insights.top_concerns,
          top_benefits: insights.top_benefits,
          recommendations: insights.recommendations,
          most_affected_groups: insights.most_affected_groups,
          detailed_feedback: feedbacks.map(fb => ({
            type: fb.feedback_type,
            text: fb.feedback_text,
            sentiment: fb.sentiment,
            category: fb.category,
            date: fb.submission_date,
            key_points: JSON.parse(fb.key_points || '[]')
          }))
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `insights_report_${policyId}_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Download as CSV
        const csvRows = [
          ['Policy Title', policyTitle || 'Policy Document'],
          ['Generated Date', new Date().toLocaleString()],
          ['Total Feedback', feedbacks.length],
          [''],
          ['Sentiment Distribution'],
          ['Positive', insights.sentiment_distribution?.positive || 0],
          ['Negative', insights.sentiment_distribution?.negative || 0],
          ['Neutral', insights.sentiment_distribution?.neutral || 0],
          [''],
          ['Top Concerns'],
          ...(insights.top_concerns || []).map((concern, i) => [`${i + 1}. ${concern}`]),
          [''],
          ['Top Benefits'],
          ...(insights.top_benefits || []).map((benefit, i) => [`${i + 1}. ${benefit}`]),
          [''],
          ['Recommendations'],
          ...(insights.recommendations || []).map((rec, i) => [`${i + 1}. ${rec}`]),
          [''],
          ['Detailed Feedback'],
          ['Date', 'Type', 'Sentiment', 'Category', 'Feedback Text'],
          ...feedbacks.map(fb => [
            new Date(fb.submission_date).toLocaleDateString(),
            fb.feedback_type,
            fb.sentiment,
            fb.category,
            fb.feedback_text.replace(/,/g, ';')
          ])
        ];

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `insights_report_${policyId}_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'txt') {
        // Download as TXT Report
        const txtContent = `
POLICY INSIGHTS REPORT
=====================================================

Policy Title: ${policyTitle || 'Policy Document'}
Generated Date: ${new Date().toLocaleString()}
Total Feedback Received: ${feedbacks.length}

=====================================================
SENTIMENT ANALYSIS
=====================================================

Positive: ${insights.sentiment_distribution?.positive || 0} (${((insights.sentiment_distribution?.positive || 0) / feedbacks.length * 100).toFixed(1)}%)
Negative: ${insights.sentiment_distribution?.negative || 0} (${((insights.sentiment_distribution?.negative || 0) / feedbacks.length * 100).toFixed(1)}%)
Neutral: ${insights.sentiment_distribution?.neutral || 0} (${((insights.sentiment_distribution?.neutral || 0) / feedbacks.length * 100).toFixed(1)}%)

Overall Sentiment:
${insights.overall_sentiment}

=====================================================
TOP CONCERNS
=====================================================

${(insights.top_concerns || []).map((concern, i) => `${i + 1}. ${concern}`).join('\n\n')}

=====================================================
TOP BENEFITS
=====================================================

${(insights.top_benefits || []).map((benefit, i) => `${i + 1}. ${benefit}`).join('\n\n')}

=====================================================
RECOMMENDATIONS FOR POLICYMAKERS
=====================================================

${(insights.recommendations || []).map((rec, i) => `${i + 1}. ${rec}`).join('\n\n')}

=====================================================
MOST AFFECTED GROUPS
=====================================================

${(insights.most_affected_groups || []).join(', ')}

=====================================================
DETAILED FEEDBACK
=====================================================

${feedbacks.map((fb, i) => `
Feedback #${i + 1}
Date: ${new Date(fb.submission_date).toLocaleString()}
Type: ${fb.feedback_type}
Sentiment: ${fb.sentiment}
Category: ${fb.category}
Text: ${fb.feedback_text}
---
`).join('\n')}

=====================================================
End of Report
=====================================================
        `;

        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `insights_report_${policyId}_${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-12 text-center">
        <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Analyzing feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchData} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Feedback Yet</h3>
        <p className="text-gray-400 mb-6">Be the first to share your thoughts on this policy!</p>
        <button onClick={fetchData} className="btn-secondary">
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Refresh
        </button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="glass-card p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Insights not available</p>
      </div>
    );
  }

  // ... [Keep all the existing chart data preparation code] ...

  const sentimentData = [
    { 
      name: 'Positive', 
      value: insights.sentiment_distribution?.positive || 0, 
      color: '#10B981',
      icon: ThumbsUp
    },
    { 
      name: 'Negative', 
      value: insights.sentiment_distribution?.negative || 0, 
      color: '#EF4444',
      icon: ThumbsDown
    },
    { 
      name: 'Neutral', 
      value: insights.sentiment_distribution?.neutral || 0, 
      color: '#F59E0B',
      icon: Minus
    },
  ].filter(item => item.value > 0);

  const categoryData = feedbacks.reduce((acc, fb) => {
    const category = fb.category || 'general';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: '#B76E79'
  }));

  const feedbackTypeData = feedbacks.reduce((acc, fb) => {
    const type = fb.feedback_type || 'general';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const feedbackTypeChartData = Object.entries(feedbackTypeData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const COLORS = ['#B76E79', '#D4949D', '#8B5462', '#E8C5A5', '#F4C7D3'];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Options */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-gray-100">Insights Dashboard</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            {/* Download Dropdown */}
            <div className="relative group">
              <button
                className="btn-primary flex items-center space-x-2"
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                  </>
                )}
              </button>
              
              {!downloading && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={() => downloadInsights('json')}
                    className="w-full px-4 py-3 text-left text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center space-x-2 rounded-t-lg"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download as JSON</span>
                  </button>
                  <button
                    onClick={() => downloadInsights('csv')}
                    className="w-full px-4 py-3 text-left text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download as CSV</span>
                  </button>
                  <button
                    onClick={() => downloadInsights('txt')}
                    className="w-full px-4 py-3 text-left text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center space-x-2 rounded-b-lg"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download as TXT</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-dark-lighter rounded-lg p-4 border border-dark-border">
          <p className="text-gray-300 leading-relaxed">{insights.overall_sentiment}</p>
        </div>
      </div>

      {/* ... [Keep all the existing dashboard content - charts, concerns, benefits, etc.] ... */}
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Feedback</p>
              <p className="text-3xl font-bold text-primary">{feedbacks.length}</p>
            </div>
            <MessageSquare className="w-12 h-12 text-primary/30" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Positive</p>
              <p className="text-3xl font-bold text-green-400">
                {insights.sentiment_distribution?.positive || 0}
              </p>
            </div>
            <ThumbsUp className="w-12 h-12 text-green-400/30" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Concerns</p>
              <p className="text-3xl font-bold text-red-400">
                {insights.sentiment_distribution?.negative || 0}
              </p>
            </div>
            <ThumbsDown className="w-12 h-12 text-red-400/30" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Neutral</p>
              <p className="text-3xl font-bold text-yellow-400">
                {insights.sentiment_distribution?.neutral || 0}
              </p>
            </div>
            <Minus className="w-12 h-12 text-yellow-400/30" />
          </div>
        </div>
      </div>

      {/* Charts - Keep existing chart code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Sentiment Distribution
          </h4>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#fff' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No sentiment data available
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
            Feedback by Category
          </h4>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#B76E79" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Keep all other existing sections: Concerns, Benefits, Recommendations, etc. */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h4 className="text-xl font-semibold text-gray-100">Top Concerns</h4>
        </div>
        <div className="space-y-3">
          {insights.top_concerns && insights.top_concerns.length > 0 ? (
            insights.top_concerns.map((concern, index) => (
              <div
                key={index}
                className="bg-dark-lighter rounded-lg p-4 border border-dark-border hover:border-red-500/30 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-gray-300 flex-1 pt-1">{concern}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No concerns identified yet</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h4 className="text-xl font-semibold text-gray-100">Top Benefits</h4>
        </div>
        <div className="space-y-3">
          {insights.top_benefits && insights.top_benefits.length > 0 ? (
            insights.top_benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-dark-lighter rounded-lg p-4 border border-dark-border hover:border-green-500/30 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-gray-300 flex-1 pt-1">{benefit}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No benefits identified yet</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="w-6 h-6 text-primary" />
          <h4 className="text-xl font-semibold text-gray-100">AI Recommendations for Policymakers</h4>
        </div>
        <div className="space-y-3">
          {insights.recommendations && insights.recommendations.length > 0 ? (
            insights.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-primary/10 to-transparent rounded-lg p-4 border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-gray-300 flex-1 pt-1">{recommendation}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recommendations available yet</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-6 h-6 text-primary" />
          <h4 className="text-xl font-semibold text-gray-100">Most Affected Groups</h4>
        </div>
        <div className="flex flex-wrap gap-3">
          {insights.most_affected_groups && insights.most_affected_groups.length > 0 ? (
            insights.most_affected_groups.map((group, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-all"
              >
                {group}
              </span>
            ))
          ) : (
            <p className="text-gray-500 w-full text-center py-4">No affected groups identified yet</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h4 className="text-xl font-semibold text-gray-100">Recent Feedback</h4>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {feedbacks.slice(0, 10).map((feedback, index) => (
            <div
              key={index}
              className="bg-dark-lighter rounded-lg p-4 border border-dark-border"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  feedback.sentiment === 'positive' 
                    ? 'bg-green-500/20 text-green-400' 
                    : feedback.sentiment === 'negative'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {feedback.sentiment}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(feedback.submission_date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{feedback.feedback_text}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-dark rounded px-2 py-1">
                  {feedback.feedback_type}
                </span>
                <span className="text-xs text-gray-500 bg-dark rounded px-2 py-1">
                  {feedback.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;