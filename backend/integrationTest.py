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

def test_integration_signup(client):
    # Create a new account
    response = client.post('/signup', json={
        'username': 'Martin',
        'password': 'password'
    })
    data = response.get_json()
    assert response.status_code == 201
    assert data['message'] == 'Account created'

    # See if integration with database works by checking if user 'Martin' was added
    user = Account.query.filter_by(username='Martin').first()
    assert user is not None
    assert user.username == 'Martin'
