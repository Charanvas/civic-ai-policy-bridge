import multiprocessing
import os

# Bind to PORT provided by Render
bind = f"0.0.0.0:{os.environ.get('PORT', '10000')}"

# Worker configuration optimized for 512MB RAM
workers = 1  # Only 1 worker for free tier
worker_class = 'sync'
worker_connections = 10
max_requests = 100  # Restart worker after 100 requests to free memory
max_requests_jitter = 20

# Timeout configuration
timeout = 300  # 5 minutes for AI processing
graceful_timeout = 30
keepalive = 5

# Memory management
preload_app = False  # Don't preload to save memory

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Process naming
proc_name = 'civic-ai-backend'
