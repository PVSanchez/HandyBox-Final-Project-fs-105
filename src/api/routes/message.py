from flask import Blueprint, jsonify, request
from extensions import socketio
from flask_socketio import emit, join_room
import os
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.database.db import db
from api.models.User import User
from api.models.Message import Message
from api.models.Service import Service

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

    professional_id = data.get('professional_id')
    if not professional_id:
        service = Service.query.get(service_id)
        professional_id = service.user_id if service else None
    room = f"room_service_id_{service_id}_professional_id_{professional_id}_user_id_{user_id}"

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

    service = Service.query.get(service_id)
    professional_id = service.user_id if service else None
    room = f"room_service_id_{service_id}_professional_id_{professional_id}_user_id_{user_id}"
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


@socketio.on('join_room')
def handle_join_room(data):
    service_id = data.get('service_id')
    user_id = data.get('user_id')
    professional_id = data.get('professional_id')
    room = f"room_service_id_{service_id}_professional_id_{professional_id}_user_id_{user_id}"
    print(
        f"[SOCKET] join_room: service_id={service_id}, professional_id={professional_id}, user_id={user_id}, room={room}")
    join_room(room)
    try:
        messages = Message.query.filter_by(
            room=room).order_by(Message.timestamp.asc()).all()
        print(f"[SOCKET] Mensajes encontrados: {len(messages)}")
        emit('chat_history', [m.serialize() for m in messages], to=request.sid)
    except Exception as e:
        print(f"[SOCKET] Error al recuperar mensajes: {e}")
        emit('chat_history', [], to=request.sid)


@socketio.on('send_message')
def handle_send_message(data):
    service_id = data.get('service_id')
    user_id = data.get('user_id')  # sala (cliente)
    sender_id = data.get('sender_id')  # remitente real
    sender_role = data.get('sender_role')
    text = data.get('text') or data.get('content')
    professional_id = data.get('professional_id')
    room = f"room_service_id_{service_id}_professional_id_{professional_id}_user_id_{user_id}"
    sender_user = User.query.get(sender_id)
    if not sender_user:
        emit('error', {'error': 'Remitente no encontrado'})
        return
    print(
        f"[SOCKET] send_message: sender_id={sender_id}, sender_role={sender_role}, user_id={user_id}, room={room}, text={text}")
    try:
        new_message = Message(
            room=room,
            sender_id=sender_user.id,
            service_id=service_id,
            content=text
        )
        db.session.add(new_message)
        db.session.commit()
        emit('new_message', new_message.serialize(), room=room)
    except Exception as e:
        db.session.rollback()
        emit('error', {'error': str(e)})


@api.route('/services/<int:user_id>', methods=['GET'])
@jwt_required()
def get_services_with_messages(user_id):
    try:
        # Obtener el rol del usuario logueado
        user = User.query.get(user_id)
        user_role = user.rol.type.value if user and user.rol else None
        result = []
        if user_role == "professional":
            # Servicios donde el profesional tiene clientes con mensajes
            service_ids = db.session.query(Message.service_id).filter(
                Message.service_id.in_(
                    db.session.query(Service.id).filter(
                        Service.user_id == user_id)
                ),
                Message.sender_id != user_id
            ).distinct().all()
            service_ids = [sid[0] for sid in service_ids]
            services = Service.query.filter(Service.id.in_(service_ids)).all()
            for service in services:
                service_dict = service.serialize()
                # Clientes con mensajes en este servicio
                client_ids = db.session.query(Message.sender_id).filter(
                    Message.service_id == service.id,
                    Message.sender_id != service.user_id
                ).distinct().all()
                clients = []
                for cid_tuple in client_ids:
                    cid = cid_tuple[0]
                    user_client = User.query.get(cid)
                    if user_client:
                        clients.append(
                            {"id": user_client.id, "name": user_client.user_name})
                service_dict["clients"] = clients
                # Solo incluir servicios con clientes activos
                if clients:
                    result.append(service_dict)
        else:
            # Servicios donde el cliente ha enviado mensajes
            service_ids = db.session.query(Message.service_id).filter(
                Message.sender_id == user_id
            ).distinct().all()
            service_ids = [sid[0] for sid in service_ids]
            services = Service.query.filter(Service.id.in_(service_ids)).all()
            for service in services:
                service_dict = service.serialize()
                # Buscar el cliente actual
                user_client = User.query.get(user_id)
                service_dict["clients"] = [
                    {"id": user_client.id, "name": user_client.user_name}] if user_client else []
                result.append(service_dict)
        return jsonify(result), 200
    except Exception as error:
        import traceback
        print("[ERROR /api/message/services/<user_id>]:", error)
        print(traceback.format_exc())
        return jsonify({'error': str(error)}), 500


@api.route('/history/<int:service_id>/<int:professional_id>/<int:user_id>', methods=['GET'])
@jwt_required()
def get_message_history(service_id, professional_id, user_id):
    room = f"room_service_id_{service_id}_professional_id_{professional_id}_user_id_{user_id}"
    try:
        messages = Message.query.filter_by(
            room=room).order_by(Message.timestamp.asc()).all()
        return jsonify([m.serialize() for m in messages]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
