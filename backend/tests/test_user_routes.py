import pytest
from app import create_app
from extensions import db
from models.user import Account

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Create a test client for the app."""
    return app.test_client()

@pytest.fixture(autouse=True)
def clean_db(app):
    """Clean up the database before each test."""
    with app.app_context():
        db.session.query(Account).delete()
        db.session.commit()

def test_get_users_empty(client):
    """Test getting users when database is empty"""
    response = client.get('/users')
    assert response.status_code == 200
    assert response.json == []

def test_get_users_with_data(client):
    """Test getting users when database has data"""
    # Create a test user
    with client.application.app_context():
        user = Account(username="testuser")
        user.hash_password("password123")
        db.session.add(user)
        db.session.commit()
    
    response = client.get('/users')
    assert response.status_code == 200
    assert response.json == ["testuser"]

def test_signup_success(client):
    """Test successful user registration"""
    response = client.post('/signup', json={
        'username': 'newuser',
        'password': 'password123'
    })
    assert response.status_code == 201
    assert response.json['message'] == "User successfully registered!"

def test_signup_duplicate_username(client):
    """Test registration with duplicate username"""
    # Create initial user
    with client.application.app_context():
        user = Account(username="testuser")
        user.hash_password("password123")
        db.session.add(user)
        db.session.commit()
    
    # Try to create user with same username
    response = client.post('/signup', json={
        'username': 'testuser',
        'password': 'password123'
    })
    assert response.status_code == 400
    assert response.json['error'] == "Username already exists" 