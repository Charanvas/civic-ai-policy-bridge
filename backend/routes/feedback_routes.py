from flask import Blueprint, request, jsonify
from models import Feedback, Policy
from utils.gemini_client import GeminiClient

feedback_bp = Blueprint('feedback', __name__)
gemini_client = GeminiClient()

@feedback_bp.route('/api/policies/<int:policy_id>/feedback', methods=['GET'])
def get_feedback(policy_id):
    """Get all feedback for a policy"""
    try:
        feedbacks = Feedback.get_by_policy(policy_id)
        
        # Parse JSON fields
        for fb in feedbacks:
            if fb.get('key_points'):
                fb['key_points'] = eval(fb['key_points'])
        
        return jsonify({"success": True, "feedback": feedbacks}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@feedback_bp.route('/api/policies/<int:policy_id>/feedback', methods=['POST'])
def submit_feedback(policy_id):
    """Submit feedback for a policy"""
    try:
        data = request.get_json()
        feedback_type = data.get('feedback_type', 'general')
        feedback_text = data.get('feedback_text', '')
        
        if not feedback_text:
            return jsonify({"success": False, "error": "Feedback text is required"}), 400
        
        # Check if policy exists
        policy = Policy.get_by_id(policy_id)
        if not policy:
            return jsonify({"success": False, "error": "Policy not found"}), 404
        
        # Analyze feedback using Gemini
        analysis = gemini_client.analyze_feedback(feedback_text, feedback_type)
        
        # Save to database
        feedback_id = Feedback.create(
            policy_id,
            feedback_type,
            feedback_text,
            analysis['sentiment'],
            analysis['key_points'],
            analysis['category']
        )
        
        return jsonify({
            "success": True,
            "message": "Feedback submitted successfully",
            "feedback_id": feedback_id,
            "analysis": analysis
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@feedback_bp.route('/api/policies/<int:policy_id>/insights', methods=['GET'])
def get_insights(policy_id):
    """Get AI-generated insights from all feedback"""
    try:
        # Check if policy exists
        policy = Policy.get_by_id(policy_id)
        if not policy:
            return jsonify({"success": False, "error": "Policy not found"}), 404
        
        # Get all feedback
        feedbacks = Feedback.get_by_policy(policy_id)
        
        if not feedbacks:
            return jsonify({
                "success": True,
                "insights": {
                    "overall_sentiment": "No feedback yet",
                    "top_concerns": [],
                    "top_benefits": [],
                    "recommendations": ["Encourage citizens to provide feedback"],
                    "most_affected_groups": [],
                    "sentiment_distribution": {"positive": 0, "negative": 0, "neutral": 0}
                }
            }), 200
        
        # Generate insights
        insights = gemini_client.generate_insights(feedbacks)
        
        return jsonify({"success": True, "insights": insights}), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500