import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

# Create app instance
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, threaded=True)
