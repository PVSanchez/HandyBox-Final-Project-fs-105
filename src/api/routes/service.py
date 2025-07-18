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
@jwt_required(optional=True)
def get_all_services():
    user_id = get_jwt_identity()
    if user_id:
        # Si está logueado, puede ver todos sus servicios (activos o no)
        user = User.query.get(int(user_id))
        if user:
            services = Service.query.filter(
                (Service.status == True) | (Service.user_id == user.id)
            ).all()
    else:
        # Público: solo servicios activos
        services = Service.query.filter_by(status=True).all()

    return jsonify([s.serialize() for s in services]), 200


@api.route('/<int:service_id>', methods=['GET'])
@jwt_required(optional=True)
def get_service_by_id(service_id):

    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Servicio no encontrado"}), 404

    current_user_id = get_jwt_identity()

    # Si el servicio está desactivado y el usuario no es el propietario
    if not service.status and service.user_id != current_user_id:
        return jsonify({"error": "El servicio no está activo"}), 403

    return jsonify(service.serialize()), 200


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


@api.route('/services/<int:id>', methods=['PUT'])
@jwt_required()
def update_service(id):
    body = request.get_json()
    if not body:
        return jsonify({"error": "Faltan datos"}), 400

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    service = Service.query.get(id)
    if not service or service.user_id != user.id:
        return jsonify({"error": "No autorizado"}), 403

    try:
        if "img" in body and body["img"]:
            upload_result = cloudinary.uploader.upload(body["img"], folder="handybox_users")
            service.img = upload_result.get("secure_url")

        if "video" in body and body["video"]:
            upload_result = cloudinary.uploader.upload(
                body["video"], folder="handybox_users", resource_type="video"
            )
            service.video = upload_result.get("secure_url")

        service.name = body.get("name", service.name)
        service.description = body.get("description", service.description)
        service.price = body.get("price", service.price)
        service.url = body.get("url", service.url)
        service.rate = body.get("rate", service.rate)

        db.session.commit()
        return jsonify(service.serialize()), 200

    except Exception as e:
        print("ERROR ACTUALIZANDO SERVICIO:", e)
        return jsonify({"error": "Error del servidor"}), 500
    

@api.route('/my-services', methods=['GET'])
@jwt_required()
def get_my_services():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    my_services = Service.query.filter_by(user_id=user.id).all()
    return jsonify([s.serialize() for s in my_services]), 200


@api.route('/services/<int:id>/status', methods=['PATCH'])
@jwt_required()
def toggle_service_status(id):
    body = request.get_json()
    if not body or "status" not in body:
        return jsonify({"error": "Falta el estado"}), 400

    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    service = Service.query.get(id)
    if not service or service.user_id != user.id:
        return jsonify({"error": "No autorizado"}), 403

    try:
        service.status = body["status"]
        db.session.commit()
        return jsonify({"success": True, "status": service.status}), 200
    except Exception as e:
        print("ERROR CAMBIANDO STATUS:", e)
        return jsonify({"error": "Error del servidor"}), 500
