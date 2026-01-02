"""
Authentication routes for user signin/signup functionality.
"""
from flask import Blueprint, request, jsonify
import uuid
import hashlib
import json
import os

auth_bp = Blueprint('auth', __name__)

# Simple user storage (in production, use a proper database)
USERS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'users.json')

def load_users():
    """Load users from file."""
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
    except:
        pass
    return {}

def save_users(users):
    """Save users to file."""
    try:
        os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
        return True
    except:
        return False

def hash_password(password):
    """Simple password hashing."""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    """Generate a simple token."""
    return str(uuid.uuid4())

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Handle user registration."""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not all([name, email, password]):
            return jsonify({
                'status': 'error',
                'message': 'All fields are required'
            }), 400
        
        if len(password) < 6:
            return jsonify({
                'status': 'error',
                'message': 'Password must be at least 6 characters long'
            }), 400
        
        # Load existing users
        users = load_users()
        
        # Check if user already exists
        if email in users:
            return jsonify({
                'status': 'error',
                'message': 'User already exists with this email'
            }), 409
        
        # Create new user
        token = generate_token()
        users[email] = {
            'name': name,
            'email': email,
            'password': hash_password(password),
            'token': token,
            'created_at': str(uuid.uuid4())  # Simple timestamp replacement
        }
        
        # Save users
        if not save_users(users):
            return jsonify({
                'status': 'error',
                'message': 'Failed to create user account'
            }), 500
        
        return jsonify({
            'status': 'success',
            'message': 'Account created successfully',
            'token': token,
            'user': {
                'name': name,
                'email': email
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Registration failed'
        }), 500

@auth_bp.route('/signin', methods=['POST'])
def signin():
    """Handle user login."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not all([email, password]):
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400
        
        # Load users
        users = load_users()
        
        # Check if user exists
        if email not in users:
            return jsonify({
                'status': 'error',
                'message': 'Invalid email or password'
            }), 401
        
        user = users[email]
        
        # Verify password
        if user['password'] != hash_password(password):
            return jsonify({
                'status': 'error',
                'message': 'Invalid email or password'
            }), 401
        
        # Generate new token
        token = generate_token()
        users[email]['token'] = token
        save_users(users)
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'token': token,
            'user': {
                'name': user['name'],
                'email': user['email']
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Login failed'
        }), 500

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify authentication token."""
    try:
        data = request.get_json()
        token = data.get('token', '')
        
        if not token:
            return jsonify({
                'status': 'error',
                'message': 'Token is required'
            }), 400
        
        # Load users
        users = load_users()
        
        # Find user with this token
        for email, user in users.items():
            if user.get('token') == token:
                return jsonify({
                    'status': 'success',
                    'message': 'Token is valid',
                    'user': {
                        'name': user['name'],
                        'email': user['email']
                    }
                })
        
        return jsonify({
            'status': 'error',
            'message': 'Invalid token'
        }), 401
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Token verification failed'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Handle user logout."""
    try:
        data = request.get_json()
        token = data.get('token', '')
        
        if not token:
            return jsonify({
                'status': 'success',
                'message': 'Logged out successfully'
            })
        
        # Load users
        users = load_users()
        
        # Remove token from user
        for email, user in users.items():
            if user.get('token') == token:
                user['token'] = ''
                save_users(users)
                break
        
        return jsonify({
            'status': 'success',
            'message': 'Logged out successfully'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'success',
            'message': 'Logged out successfully'
        })