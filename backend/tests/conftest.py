import pytest
import os
import sys

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture(autouse=True)
def env_setup():
    """Set up test environment variables"""
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['FLASK_APP'] = 'app.py'
    yield
    # Clean up after tests
    if 'FLASK_ENV' in os.environ:
        del os.environ['FLASK_ENV']
    if 'FLASK_APP' in os.environ:
        del os.environ['FLASK_APP'] 