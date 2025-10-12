from flask import Blueprint, request, jsonify
from models import Policy
from utils.gemini_client import GeminiClient

chatbot_bp = Blueprint('chatbot', __name__)
gemini_client = GeminiClient()

@chatbot_bp.route('/api/policies/<int:policy_id>/chat', methods=['POST'])
def chat_with_policy(policy_id):
    """Chat with AI about a specific policy"""
    try:
        data = request.get_json()
        user_question = data.get('question', '')
        
        print(f"📝 Received chat request for policy {policy_id}")
        print(f"❓ Question: {user_question}")
        
        if not user_question:
            return jsonify({"success": False, "error": "Question is required"}), 400
        
        # Get policy from database
        policy = Policy.get_by_id(policy_id)
        if not policy:
            print(f"❌ Policy {policy_id} not found")
            return jsonify({"success": False, "error": "Policy not found"}), 404
        
        print(f"✅ Found policy: {policy.get('title')}")
        
        # Get answer from Gemini
        print("🤖 Asking Gemini AI...")
        answer = gemini_client.answer_policy_question(
            policy['original_text'],
            policy.get('simplified_text', ''),
            user_question
        )
        
        print(f"✅ Got answer: {answer[:100]}...")
        
        return jsonify({
            "success": True,
            "answer": answer,
            "question": user_question
        }), 200
        
    except Exception as e:
        print(f"❌ Chatbot error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": f"Internal server error: {str(e)}"
        }), 500