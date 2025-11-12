"""
Flask Backend Server for Futuristic Games Platform
Serves the React frontend and provides API endpoints if needed
"""

from flask import Flask, render_template, send_from_directory, jsonify
from flask_cors import CORS
import os

app = Flask(__name__, 
            static_folder='dist',
            template_folder='dist')
CORS(app)  # Enable CORS for API calls if needed

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'

# Port configuration
PORT = int(os.environ.get('PORT', 8081))


@app.route('/')
def index():
    """Serve the main React app"""
    try:
        return send_from_directory('dist', 'index.html')
    except FileNotFoundError:
        # Fallback: serve from root if dist doesn't exist (development mode)
        return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from dist directory"""
    try:
        # Try to serve from dist first (production build)
        if os.path.exists('dist'):
            return send_from_directory('dist', path)
        else:
            # Development fallback
            return send_from_directory('.', path)
    except FileNotFoundError:
        # If file not found, serve index.html for React Router
        if os.path.exists('dist'):
            return send_from_directory('dist', 'index.html')
        else:
            return send_from_directory('.', 'index.html')


@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Flask server is running',
        'port': PORT
    })


@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors - serve React app for client-side routing"""
    try:
        if os.path.exists('dist'):
            return send_from_directory('dist', 'index.html')
        else:
            return send_from_directory('.', 'index.html')
    except:
        return jsonify({'error': 'Not found'}), 404


if __name__ == '__main__':
    print(f"""
    ╔═══════════════════════════════════════════════════════════╗
    ║   Futuristic Games Platform - Flask Backend Server       ║
    ╚═══════════════════════════════════════════════════════════╝
    
    🚀 Server starting on http://localhost:{PORT}
    📁 Serving from: {'dist' if os.path.exists('dist') else 'root directory'}
    🔧 Debug mode: {app.config['DEBUG']}
    
    ⚠️  IMPORTANT: 
    - For production: Build React app first with 'npm run build'
    - For development: Use 'npm run dev' (runs on port 8080)
    - This Flask server is for production deployment
    
    """)
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=app.config['DEBUG']
    )

