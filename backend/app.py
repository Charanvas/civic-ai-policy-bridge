from flask import Flask
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
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Create directories
    os.makedirs('database', exist_ok=True)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    
    # Initialize database
    init_db()
    
    # Register blueprints
    app.register_blueprint(policy_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(chatbot_bp)
    
    @app.route('/', methods=['GET'])
    def root():
        return {
            "message": "Civic AI Policy Bridge API",
            "status": "running",
            "version": "1.0.0"
        }, 200
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {"status": "healthy"}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=Config.PORT,
        debug=False
    )
