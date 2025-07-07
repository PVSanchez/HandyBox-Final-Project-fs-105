from flask import Blueprint, request, jsonify
from api.models.ServiceState import ServiceState
from api.database.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS

api = Blueprint('service_state_api', __name__)
CORS(api)

@api.route('/', methods=['POST'])
@jwt_required()
def create_service_state():
    data = request.get_json()
    required_fields = ['stripe_id', 'client_id', 'profesional_id', 'service_id', 'hours']
    allowed_status = ['pending', 'success', 'in progress']
    status = data.get('status', 'pending')
    if status not in allowed_status:
        return jsonify({'error': f"El status debe ser uno de: {', '.join(allowed_status)}"}), 400
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Falta el campo {field}'}), 400
    try:
        new_state = ServiceState(
            stripe_id=data['stripe_id'],
            client_id=data['client_id'],
            profesional_id=data['profesional_id'],
            service_id=data['service_id'],
            status=status,
            hours=data['hours']
        )
        db.session.add(new_state)
        db.session.commit()
        return jsonify({'message': 'Estado de servicio creado', 'service_state': new_state.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api.route('/', methods=['GET'])
@jwt_required()
def get_all_service_states():
    try:
        service_states = ServiceState.query.all()
        return jsonify([s.serialize() for s in service_states]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_service_state(id):
    data = request.get_json()
    allowed_status = ['pending', 'success', 'in progress']
    status = data.get('status')
    if not status or status not in allowed_status:
        return jsonify({'error': f"El status debe ser uno de: {', '.join(allowed_status)}"}), 400
    try:
        service_state = ServiceState.query.get(id)
        if not service_state:
            return jsonify({'error': 'Estado de servicio no encontrado'}), 404
        service_state.status = status
        db.session.commit()
        return jsonify({'message': 'Estado actualizado', 'service_state': service_state.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
