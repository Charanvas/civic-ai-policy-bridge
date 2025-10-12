import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Upload, MessageSquare, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import PolicyUpload from '../components/PolicyUpload';

const HomePage = () => {
  const features = [
    {
      icon: Upload,
      title: 'Upload Policy Documents',
      description: 'Upload PDF, DOCX, or TXT files and let AI simplify complex legal language',
      color: 'from-primary to-primary-dark',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Simplification',
      description: 'Transform technical policy text into accessible language for everyone',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MessageSquare,
      title: 'Collect Citizen Feedback',
      description: 'Enable citizens to share their thoughts, concerns, and suggestions',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Real-time Insights',
      description: 'Get AI-generated insights and actionable recommendations for policymakers',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-3 mb-4 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <Scale className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Making Democracy Accessible</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            <span className="gradient-text">Civic AI</span>
            <br />
            <span className="text-gray-100">Policy Bridge</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Transform complex government policies into accessible language. 
            Empower citizens with understanding and give policymakers actionable insights.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <a href="#upload" className="btn-primary inline-flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Policy</span>
          </a>
          <Link to="/dashboard" className="btn-secondary inline-flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>View Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="section-title text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 card-hover group"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} 
                            flex items-center justify-center mb-4 
                            group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-100 mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="py-12">
        <PolicyUpload />
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="glass-card p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">99%</div>
              <p className="text-gray-400">Accuracy Rate</p>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">5+</div>
              <p className="text-gray-400">Reading Levels</p>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">24/7</div>
              <p className="text-gray-400">AI Processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="glass-card p-12 text-center">
          <Scale className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold gradient-text mb-4">
            Ready to Make Policies Accessible?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join us in bridging the gap between policymakers and citizens. 
            Upload your first policy document today.
          </p>
          <a href="#upload" className="btn-primary inline-flex items-center space-x-2">
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;