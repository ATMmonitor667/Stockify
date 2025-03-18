# routes/user_routes.py
from flask import Blueprint, jsonify, request
from extensions import db
from models.user import Account
from flask_cors import cross_origin

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/users', methods=['GET'])
@cross_origin()
def get_users():
    users = Account.query.all()
    return jsonify([user.username for user in users])

@user_routes.route('/signup', methods=['POST', 'OPTIONS'])
@cross_origin()
def add_user():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Missing username or password"}), 400
            
        # Check if the username already exists
        existing_user = Account.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400

        # Create a new user and hash the password
        new_user = Account(username=data['username'])
        new_user.hash_password(data['password'])

        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User successfully registered!"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

