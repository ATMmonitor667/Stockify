import pytest
from models.user import Account
from extensions import db

def test_user_creation():
    """Test creating a new user"""
    user = Account(username="testuser")
    assert user.username == "testuser"
    assert user.id is None  # ID is None before being added to database

def test_password_hashing():
    """Test password hashing functionality"""
    user = Account(username="testuser")
    password = "testpassword123"
    user.hash_password(password)
    assert user.hashPass != password  # Password should be hashed
    assert user.check_password(password)  # Should verify correct password
    assert not user.check_password("wrongpassword")  # Should reject wrong password

def test_user_repr():
    """Test string representation of user"""
    user = Account(username="testuser")
    assert str(user) == "<User testuser>" 