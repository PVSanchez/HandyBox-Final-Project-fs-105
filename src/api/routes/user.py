from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models.User import User
from api.models.Rol import Rol, Role
from flask import Blueprint, jsonify, request
from api.database.db import db
import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re
from datetime import datetime, timedelta
from flask_cors import CORS
import cloudinary
import cloudinary.uploader
import os
from api.service.email import send_email

api = Blueprint('api/user', __name__)
CORS(api)

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None


def validate_password(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True


def get_rol_id_by_type(rol_type):
    rol = Rol.query.filter_by(type=rol_type).first()
    if rol:
        return rol.id
    return None


@api.route('/', methods=['GET'])
def get_users():
    all_user = User.query.all()
    all_user_serialize = list(map(lambda user: user.serialize(), all_user))
    return jsonify(all_user_serialize), 200


@api.route('/register/<rol_type>', methods=['POST'])
def user_register(rol_type):

    try:
        body = request.get_json()
        img_url = None
        if 'img' in body and body['img']:
            try:
                upload_result = cloudinary.uploader.upload(
                    body['img'], folder="handybox_users")
                img_url = upload_result.get('secure_url')
            except Exception as img_exc:
                print('ERROR SUBIENDO IMAGEN A CLOUDINARY:', img_exc)
                img_url = None

        required_fields = ['email', 'password',
                           'user_name', 'first_name', 'last_name']
        for field in required_fields:
            if field not in body or not body[field]:
                return jsonify({'error': f'El campo {field} es requerido'}), 400

        if not validate_email(body['email']):
            return jsonify({'error': 'Formato de email inválido'}), 400

        if not validate_password(body['password']):
            return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'}), 400

        rol_id = get_rol_id_by_type(rol_type)
        print(rol_id, rol_type)
        if rol_id is None:
            return jsonify({'error': 'El tipo de rol debe ser "client" o "professional"'}), 400

        existing_user = User.query.filter_by(email=body['email']).first()
        if existing_user:
            return jsonify({'error': 'El usuario ya existe'}), 400

        new_pass = bcrypt.hashpw(body['password'].encode(), bcrypt.gensalt())

        new_user = User()
        new_user.email = body['email']
        new_user.password = new_pass.decode()
        new_user.user_name = body['user_name']
        new_user.first_name = body['first_name']
        new_user.last_name = body['last_name']
        new_user.date = datetime.now()
        new_user.rol_id = rol_id
        new_user.img = img_url

        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'Usuario creado exitosamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/login', methods=['POST'])
def user_login():

    try:
        body = request.get_json()
        if not body or 'email' not in body or 'password' not in body:
            return jsonify({'error': 'Falta el email o el password'}), 400

        user = User.query.filter_by(email=body['email']).first()
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        if not bcrypt.checkpw(body['password'].encode(), user.password.encode()):
            return jsonify({'error': 'Contraseña incorrecta'}), 401

        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'Login exitoso',
            'token': access_token,
            'user': user.serialize()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/logout', methods=['POST'])
@jwt_required()
def user_logout():

    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        return jsonify({'message': 'Sesión cerrada exitosamente'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/me', methods=['PUT', 'GET'])
@jwt_required()
def update_user():

    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        if request.method == 'GET':
            return jsonify(user.serialize()), 200
        body = request.get_json()
        for field in ['user_name', 'first_name', 'last_name', 'email', 'password', 'img']:
            if field in body and body[field]:
                if field == 'password':
                    if not validate_password(body['password']):
                        return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'}), 400
                    user.password = bcrypt.hashpw(
                        body['password'].encode(), bcrypt.gensalt()).decode()
                elif field == 'email':
                    if not validate_email(body['email']):
                        return jsonify({'error': 'Formato de email inválido'}), 400
                    user.email = body['email']
                elif field == 'img':
                    img_value = body['img']

                    if img_value.startswith('data:image'):
                        try:
                            upload_result = cloudinary.uploader.upload(
                                img_value, folder="handybox_users")
                            img_url = upload_result.get('secure_url')
                            user.img = img_url
                        except Exception as img_exc:
                            print('ERROR SUBIENDO IMAGEN A CLOUDINARY:', img_exc)

                    else:
                        user.img = img_value
                else:
                    setattr(user, field, body[field])
        db.session.commit()
        return jsonify({'message': 'Usuario actualizado', 'user': user.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        body = request.get_json()
        email = body.get('email')

        if not email or not validate_email(email):
            return jsonify({'error': 'Email inválido'}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            # Para evitar dar a conocer si un mail está
            return jsonify({'message': 'Si el correo existe, se ha enviado un enlace (NO EXISTE ESTO ES PRUEBA)'}), 200
        url = os.getenv('VITE_FRONTEND_URL')
        reset_token = create_access_token(identity=str(
            user.id), expires_delta=timedelta(hours=1))
        reset_link = f"{url}reset-password?token={reset_token}"
        send_email(user.email, "Recupera tu contraseña",
                   f"Haz clic en el siguiente enlace para restablecer tu contraseña:\n\n{reset_link}")

        return jsonify({'message': 'Si el correo existe, se ha enviado un enlace (SI EXISTE ESTO ES UNA PRUEBA)'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/reset-password', methods=['POST'])
@jwt_required()
def reset_password():
    body = request.get_json()
    new_password = body.get('password')

    if not new_password:
        return jsonify({'error': 'Contraseña requerida'}), 400

    if not validate_password(new_password):
        return jsonify({'error': 'Contraseña débil'}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    user.password = bcrypt.hashpw(
        new_password.encode(), bcrypt.gensalt()).decode()
    db.session.commit()

    return jsonify({'message': 'Contraseña restablecida con éxito'}), 200
