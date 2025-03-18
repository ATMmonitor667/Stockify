import pytest
from app import app, db
from models.user import Account

@pytest.fixture
def client():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' 
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()  
        yield client
        with app.app_context():
            db.drop_all()  

def test_signup_success(client):
    response = client.post('/signup', json={
        'username': 'Martin',
        'password': 'pass'
    })
    data = response.get_json()
    assert response.status_code == 201
    assert data['message'] == 'Account created'

#Only error I have so far for signUps is if someone has the same username, 
#SO  I will test that 
def test_signup_username_exists(client):
    #Add a new user
    client.post('/signup', json={
        'username': 'NewUser',
        'password': 'password'
    })

    #Add another user with same username (Should be getting an error)
    response = client.post('/signup', json={
        'username': 'NewUser',
        'password': 'password'
    })
    data = response.get_json()
    assert response.status_code == 400
    assert data['error'] == 'Username already exists'