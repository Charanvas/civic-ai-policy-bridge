# This file makes the routes directory a Python package
from .policy_routes import policy_bp
from .feedback_routes import feedback_bp
from .chatbot_routes import chatbot_bp  # ADD THIS LINE

__all__ = ['policy_bp', 'feedback_bp', 'chatbot_bp']  # ADD chatbot_bp HERE