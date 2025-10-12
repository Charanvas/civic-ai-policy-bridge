from flask import Flask, send_from_directory
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
    
    # Enable CORS for production
    CORS(app, resources={
        r"/api/*": {
            "origins": Config.CORS_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize database
    os.makedirs('database', exist_ok=True)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    init_db()
    
    # Register blueprints
    app.register_blueprint(policy_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(chatbot_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {
            "status": "healthy", 
            "message": "Civic AI Policy Bridge API",
            "environment": os.getenv('FLASK_ENV', 'production')
        }, 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return {
            "message": "Civic AI Policy Bridge API",
            "version": "1.0.0",
            "endpoints": {
                "health": "/api/health",
                "policies": "/api/policies",
                "feedback": "/api/policies/{id}/feedback",
                "chat": "/api/policies/{id}/chat"
            }
        }, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)