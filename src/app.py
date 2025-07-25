"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from api.routes.rate import api as rate_api
from extensions import socketio
from api.routes.message import api as message_api
from flask_jwt_extended import JWTManager
from api.routes.userDetail import api as user_detail_api
from api.routes.stripePay import api as stripe_pay_api
from api.routes.serviceState import api as service_state_api
from flask_cors import CORS
from api.routes.stripe import api as payment_api
from api.commands import setup_commands
from api.admin import setup_admin
from api.routes.service import api as service_api
from api.routes.user import api as user_api
from api.database.db import db
from api.utils import APIException, generate_sitemap
from flask_swagger import swagger
from flask_migrate import Migrate
from flask import Flask, request, jsonify, url_for, send_from_directory
import os
from dotenv import load_dotenv
load_dotenv()


from flask_jwt_extended import JWTManager

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
CORS(app)

app.register_blueprint(user_api, url_prefix='/api/user')
app.register_blueprint(service_api, url_prefix='/api/service')
app.register_blueprint(payment_api, url_prefix='/api/payment')
app.register_blueprint(service_state_api, url_prefix='/api/service-state')
app.register_blueprint(stripe_pay_api, url_prefix='/api/stripe-pay')
app.register_blueprint(rate_api, url_prefix='/api/rate')
app.register_blueprint(user_detail_api, url_prefix='/api/user-detail')
app.register_blueprint(message_api, url_prefix='/api/message')




app.url_map.strict_slashes = False


app.config["JWT_SECRET_KEY"] = os.environ.get(
    'JWT_SECRET_KEY', 'super-secret-key')
jwt = JWTManager(app)

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)