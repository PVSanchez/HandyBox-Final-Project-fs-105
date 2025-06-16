from flask import Blueprint, jsonify, request
from api.models.Service import Service
from api.models.User import User
from api.database.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Blueprint('api/service', __name__)


@api.route('/register', methods=['POST'])
@jwt_required()
def create_service():
    body = request.get_json()

    if body is None:
        return jsonify({"error": "Error al enviar los datos"}), 400

    if "name" not in body:
        return jsonify({"error": "Falta el nombre"}), 400

    if "description" not in body:
        return jsonify({"error": "Falta la descripcion"}), 400

    if "price" not in body:
        return jsonify({"error": "Falta el precio"}), 400

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    existing_name = Service.query.filter_by(name=body["name"]).first()
    if existing_name:
        return jsonify({"error": "Nombre de servicio ya existente"}), 400

    new_service = Service(
        name=body["name"],
        description=body['description'],
        img=body.get('img'),
        video=body.get('video'),
        price=body['price'],
        url=body.get('url'),
        rate=body.get('rate'),
        user_id=user.id,
        status=body.get('status'),
    )

    db.session.add(new_service)
    db.session.commit()

    return jsonify(new_service.serialize()), 201
