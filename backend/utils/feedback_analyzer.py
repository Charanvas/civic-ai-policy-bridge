import json
from collections import Counter
from datetime import datetime

class FeedbackAnalyzer:
    """Utility class for analyzing feedback patterns"""
    
    @staticmethod
    def analyze_sentiment_trend(feedbacks):
        """Analyze sentiment trends over time"""
        sentiment_timeline = []
        
        for fb in feedbacks:
            sentiment_timeline.append({
                'date': fb.get('submission_date'),
                'sentiment': fb.get('sentiment', 'neutral')
            })
        
        return sentiment_timeline
    
    @staticmethod
    def get_category_distribution(feedbacks):
        """Get distribution of feedback categories"""
        categories = [fb.get('category', 'general') for fb in feedbacks]
        return dict(Counter(categories))
    
    @staticmethod
    def get_top_keywords(feedbacks, top_n=10):
        """Extract top keywords from feedback"""
        # Simple keyword extraction (can be enhanced with NLP)
        all_text = ' '.join([fb.get('feedback_text', '') for fb in feedbacks])
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        words = [word.lower() for word in all_text.split() if word.lower() not in stop_words and len(word) > 3]
        
        word_counts = Counter(words)
        return dict(word_counts.most_common(top_n))
    
    @staticmethod
    def calculate_engagement_score(feedbacks):
        """Calculate engagement score based on feedback quantity and quality"""
        if not feedbacks:
            return 0
        
        total_feedback = len(feedbacks)
        detailed_feedback = sum(1 for fb in feedbacks if len(fb.get('feedback_text', '')) > 100)
        
        # Score from 0-100
        score = min(100, (total_feedback * 10) + (detailed_feedback * 5))
        return score