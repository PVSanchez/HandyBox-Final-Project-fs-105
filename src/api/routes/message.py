from flask import Blueprint, jsonify, request
from extensions import socketio
from flask_socketio import emit, join_room
import os
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.database.db import db
from api.models.User import User
from api.models.Message import Message

api = Blueprint('message_bp', __name__)
CORS(api)


@api.route('/', methods=['POST'])
@jwt_required()
def create_message():
    data = request.get_json()
    service_id = data.get('service_id')
    content = data.get('content')

    if not service_id or not content:
        return jsonify({'error': 'Faltan campos requeridos: service_id y content'}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    room = f"room_{service_id}_{user_id}"

    try:
        new_message = Message(
            room=room,
            sender_id=user.id,
            service_id=service_id,
            content=content
        )
        db.session.add(new_message)
        db.session.commit()

        socketio.emit('new_message', new_message.serialize(), room=room)

        return jsonify({'message': 'Mensaje creado', 'message_data': new_message.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/<int:service_id>/<int:user_id>', methods=['GET'])
@jwt_required()
def get_messages(service_id, user_id):
    room = f"room_{service_id}_{user_id}"
    try:
        messages = Message.query.filter_by(
            room=room).order_by(Message.timestamp.desc()).all()
        return jsonify([m.serialize() for m in messages]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/read/<int:service_id>/<int:user_id>', methods=['PUT'])
@jwt_required()
def mark_messages_as_read(service_id, user_id):
    try:

        messages = Message.query.filter_by(service_id=service_id, is_read=False).filter(
            Message.sender_id != user_id).all()
        for msg in messages:
            msg.is_read = True
        db.session.commit()
        return jsonify({'message': 'Mensajes marcados como leídos'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/unread/<int:service_id>/<int:user_id>', methods=['GET'])
@jwt_required()
def get_unread_count(service_id, user_id):
    try:
        count = Message.query.filter_by(service_id=service_id, is_read=False).filter(
            Message.sender_id != user_id).count()
        return jsonify({'unread_count': count}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
