from flask import Blueprint, request, jsonify
from api.models.UserDetail import UserDetail
from api.database.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity
import cloudinary
import cloudinary.uploader
import os

api = Blueprint('user_detail_api', __name__)

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


@api.route('/', methods=['POST'])
@jwt_required()
def create_user_detail():
    data = request.get_json()
    user_id = data.get('user_id')
    acerca_de_mi = data.get('acerca_de_mi')
    experiencia_laboral = data.get('experiencia_laboral')
    portfolio = data.get('portfolio')
    video = data.get('video')
    video_url = None
    if video:
        try:
            upload_result = cloudinary.uploader.upload(
                video,
                folder="handybox_users",
                resource_type="video"
            )
            video_url = upload_result.get('secure_url')
        except Exception as video_exc:
            print('ERROR SUBIENDO EL VIDEO A CLOUDINARY:', video_exc)
            video_url = None
    if not user_id:
        return jsonify({'error': 'user_id es requerido'}), 400
    try:
        detail = UserDetail(
            user_id=user_id,
            acerca_de_mi=acerca_de_mi,
            experiencia_laboral=experiencia_laboral,
            portfolio=portfolio,
            video=video_url
        )
        db.session.add(detail)
        db.session.commit()
        return jsonify(detail.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_detail(user_id):
    detail = UserDetail.query.filter_by(user_id=user_id).first()
    if not detail:
        return jsonify({'error': 'No existen datos de este usuario'}), 404
    return jsonify(detail.serialize()), 200


@api.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_detail(user_id):
    data = request.get_json()
    detail = UserDetail.query.filter_by(user_id=user_id).first()
    if not detail:
        return jsonify({'error': 'No existen datos de este usuario'}), 404
    detail.acerca_de_mi = data.get('acerca_de_mi', detail.acerca_de_mi)
    detail.experiencia_laboral = data.get(
        'experiencia_laboral', detail.experiencia_laboral)
    detail.portfolio = data.get('portfolio', detail.portfolio)
    video = data.get('video')
    if video:
        try:
            upload_result = cloudinary.uploader.upload(
                video,
                folder="handybox_users",
                resource_type="video"
            )
            detail.video = upload_result.get('secure_url')
        except Exception as video_exc:
            print('ERROR SUBIENDO EL VIDEO A CLOUDINARY:', video_exc)
            # Si falla, mantiene el valor anterior
    else:
        detail.video = data.get('video', detail.video)
    try:
        db.session.commit()
        return jsonify(detail.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user_detail(user_id):
    detail = UserDetail.query.filter_by(user_id=user_id).first()
    if not detail:
        return jsonify({'error': 'No existen datos de este usuario'}), 404
    try:
        db.session.delete(detail)
        db.session.commit()
        return jsonify({'msg': 'Datos eliminados'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
