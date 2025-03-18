from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from extensions import db  # Remove relative import

def create_app(test_config=None):
    # Initialize the Flask app
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app, supports_credentials=True)
    
    if test_config is None:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    else:
        app.config.update(test_config)
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 

    # Initialize database
    db.init_app(app)
    migrate = Migrate(app, db)

    # Register blueprints
    from routes.user_routes import user_routes  # Remove relative import
    app.register_blueprint(user_routes)

    @app.route('/')
    def home():
        return jsonify({"message": "working"})

    return app

# Create the app instance
app = create_app()

# Create tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
