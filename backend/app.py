from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import init_db
from routes.policy_routes import policy_bp
from routes.feedback_routes import feedback_bp
from routes.chatbot_routes import chatbot_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": Config.CORS_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False
        }
    })
    
    # Create necessary directories
    os.makedirs('database', exist_ok=True)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    
    # Initialize database
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization error: {str(e)}")
    
    # Register blueprints
    app.register_blueprint(policy_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(chatbot_bp)
    
    # Root route
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            "message": "Civic AI Policy Bridge API",
            "status": "running",
            "version": "1.0.0",
            "endpoints": {
                "health": "/api/health",
                "policies": "/api/policies"
            }
        }), 200
    
    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "API is running"
        }), 200
    
    print("✅ Flask app created successfully")
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
