from flask import Blueprint, jsonify, request
from api.models.Service import Service
from api.models.User import User
from api.database.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
import cloudinary
import cloudinary.uploader
import os

api = Blueprint('api/service', __name__)
CORS(api)

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


@api.route('/', methods=['GET'])
def get_all_service():
    all_service = Service.query.all()
    all_service_serialize = list(
        map(lambda service: service.serialize(), all_service))
    return jsonify(all_service_serialize), 200

@api.route('/<int:service_id>')
def get_service_by_id(service_id):
    id_service = Service.query.get(service_id)
    if not id_service:
        return jsonify({"error": "Servicio no encontrado"}), 404
    return jsonify(id_service.serialize()), 200

@api.route('/users/<int:user_id>')
def get_services_by_user(user_id):
    current_user = User.query.get(user_id)

    if not current_user:
        return jsonify({'error': "Usuario no encontrado"}), 404

    user_services = Service.query.filter_by(user_id=user_id).all()
    services_serialized = list(
        map(lambda serv: serv.serialize(), user_services))

    return jsonify(services_serialized), 200


@api.route('/register', methods=['POST'])
@jwt_required()
def create_service():
    body = request.get_json()
    img_url = None
    video_url = None

    if "img" in body and body['img']:
        try:
            upload_result = cloudinary.uploader.upload(
                body['img'], folder="handybox_users")
            img_url = upload_result.get('secure_url')
        except Exception as img_exc:
            print('ERROR SUBIENDO IMAGEN A CLOUDINARY:', img_exc)
            img_url = None

    if "video" in body and body['video']:
        try:
            upload_result = cloudinary.uploader.upload(
                body['video'],
                folder="handybox_users",
                resource_type="video")
            video_url = upload_result.get('secure_url')
        except Exception as video_exc:
            print('ERROR SUBIENDO EL VIDEO A CLOUDINARY:', video_exc)
            video_url = None

    if body is None:
        return jsonify({"Error": "Error al enviar los datos"}), 400

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if user.rol_id == 1:
        return jsonify({"error": "El usuario no tiene permiso"}), 400

    if "name" not in body:
        return jsonify({"error": "Falta el nombre"}), 400

    if "description" not in body:
        return jsonify({"error": "Falta la descripcion"}), 400

    if "price" not in body:
        return jsonify({"error": "Falta el precio"}), 400
    
    existing_name = Service.query.filter_by(name=body["name"]).first()

    if existing_name:
        return jsonify({"error": "Nombre de servicio ya existente"}), 400

    new_service = Service(
        name=body["name"],
        description=body['description'],
        img=img_url,
        video=video_url,
        price=body['price'],
        url=body.get('url'),
        rate=body.get('rate'),
        user_id=user.id,
        status=body.get('status'),
    )

    db.session.add(new_service)
    db.session.commit()

    return jsonify(new_service.serialize()), 201
