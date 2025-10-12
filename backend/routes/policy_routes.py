from flask import Blueprint, request, jsonify
from models import Policy
from utils.document_processor import DocumentProcessor
from utils.gemini_client import GeminiClient
import os

policy_bp = Blueprint('policy', __name__)
gemini_client = GeminiClient()

@policy_bp.route('/api/policies', methods=['GET'])
def get_policies():
    """Get all policies"""
    try:
        policies = Policy.get_all()
        return jsonify({"success": True, "policies": policies}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@policy_bp.route('/api/policies/<int:policy_id>', methods=['GET'])
def get_policy(policy_id):
    """Get specific policy"""
    try:
        policy = Policy.get_by_id(policy_id)
        if policy:
            # Parse JSON fields
            if policy.get('demographic_impacts'):
                policy['demographic_impacts'] = eval(policy['demographic_impacts'])
            return jsonify({"success": True, "policy": policy}), 200
        else:
            return jsonify({"success": False, "error": "Policy not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@policy_bp.route('/api/policies/upload', methods=['POST'])
def upload_policy():
    """Upload and process a new policy document"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file provided"}), 400
        
        file = request.files['file']
        # Remove title from form data - we'll extract it automatically
        reading_level = request.form.get('reading_level', 'high_school')
        
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
        
        # Extract text from document
        original_text = DocumentProcessor.process_document(file)
        
        if not original_text:
            return jsonify({"success": False, "error": "Could not extract text from document"}), 400
        
        # Auto-extract title from document
        print("Extracting title from document...")
        title = gemini_client.extract_policy_title(original_text)
        print(f"Extracted title: {title}")
        
        # Simplify policy text
        print("Simplifying policy text...")
        simplified_text = gemini_client.simplify_policy(original_text, reading_level)
        
        # Analyze demographic impacts
        print("Analyzing demographic impacts...")
        demographic_impacts = gemini_client.analyze_demographic_impacts(original_text)
        
        # Save to database
        policy_id = Policy.create(title, original_text, simplified_text, demographic_impacts, reading_level)
        
        return jsonify({
            "success": True,
            "message": "Policy uploaded and processed successfully",
            "policy_id": policy_id,
            "title": title
        }), 201
        
    except Exception as e:
        print(f"Error uploading policy: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@policy_bp.route('/api/policies/<int:policy_id>/simplify', methods=['POST'])
def resimplify_policy(policy_id):
    """Re-simplify policy with different reading level"""
    try:
        data = request.get_json()
        reading_level = data.get('reading_level', 'high_school')
        
        policy = Policy.get_by_id(policy_id)
        if not policy:
            return jsonify({"success": False, "error": "Policy not found"}), 404
        
        # Re-simplify
        simplified_text = gemini_client.simplify_policy(policy['original_text'], reading_level)
        
        # Update database
        from models import get_db_connection
        conn = get_db_connection()
        conn.execute('UPDATE policies SET simplified_text = ?, reading_level = ? WHERE id = ?',
                     (simplified_text, reading_level, policy_id))
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "simplified_text": simplified_text
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500