import React from 'react';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DemographicImpact = ({ demographics }) => {
  const getImpactIcon = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'positive':
        return 'border-green-500/30 bg-green-500/5';
      case 'negative':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-yellow-500/30 bg-yellow-500/5';
    }
  };

  const demographicLabels = {
    students: 'Students',
    farmers: 'Farmers',
    business_owners: 'Business Owners',
    senior_citizens: 'Senior Citizens',
    parents: 'Parents',
    women: 'Women',
    low_income_families: 'Low-income Families',
    urban_residents: 'Urban Residents',
    rural_residents: 'Rural Residents',
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold text-gray-100">Demographic Impact Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demographics && Object.entries(demographics).map(([key, data]) => (
          <div
            key={key}
            className={`rounded-lg p-5 border transition-all hover:shadow-lg ${getImpactColor(
              data.impact
            )}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-100">
                {demographicLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </h4>
              {getImpactIcon(data.impact)}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                  Impact
                </p>
                <p className="text-sm text-gray-300 capitalize">{data.impact}</p>
              </div>

              {data.concerns && (
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                    Concerns
                  </p>
                  <p className="text-sm text-gray-300">{data.concerns}</p>
                </div>
              )}

              {data.benefits && (
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                    Benefits
                  </p>
                  <p className="text-sm text-gray-300">{data.benefits}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(!demographics || Object.keys(demographics).length === 0) && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No demographic analysis available</p>
        </div>
      )}
    </div>
  );
};

export default DemographicImpact;