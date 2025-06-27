from flask import Blueprint, request, jsonify
from api.models.UserDetail import UserDetail
from api.database.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Blueprint('user_detail_api', __name__)

@api.route('/', methods=['POST'])
@jwt_required()
def create_user_detail():
    data = request.get_json()
    user_id = data.get('user_id')
    description = data.get('description')
    preparation = data.get('preparation')
    CV = data.get('CV')
    portfolio = data.get('portfolio')
    if not user_id:
        return jsonify({'error': 'user_id es requerido'}), 400
    try:
        detail = UserDetail(
            user_id=user_id,
            description=description,
            preparation=preparation,
            CV=CV,
            portfolio=portfolio
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
    detail.description = data.get('description', detail.description)
    detail.preparation = data.get('preparation', detail.preparation)
    detail.CV = data.get('CV', detail.CV)
    detail.portfolio = data.get('portfolio', detail.portfolio)
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
