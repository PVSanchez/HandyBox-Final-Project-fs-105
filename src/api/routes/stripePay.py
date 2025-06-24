from flask import Blueprint, request, jsonify
from api.models.StripePay import StripePay
from api.models.Service import Service
from api.models.ServiceState import ServiceState
from api.database.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS

api = Blueprint('stripe_pay_api', __name__)
CORS(api)


@api.route('', methods=['POST'])
@jwt_required()
def create_stripe_pay():
    data = request.get_json()
    required_fields = [
        'stripe_payment_id', 'service_ids', 'service_quantities', 'amount', 'currency'
    ]
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Falta el campo {field}'}), 400

    user_id = get_jwt_identity()
    try:
        new_pay = StripePay(
            stripe_payment_id=data['stripe_payment_id'],
            user_id=user_id,
            service_ids=','.join(map(str, data['service_ids'])),
            service_quantities=','.join(map(str, data['service_quantities'])),
            amount=data['amount'],
            currency=data['currency']
        )
        db.session.add(new_pay)
        db.session.commit()

        service_states_created = []
        for index, service_id in enumerate(data['service_ids']):
            service = Service.query.get(service_id)
            if not service:
                continue
            professional_user_id = service.user_id
            service_hours = data['service_quantities'][index] if index < len(data['service_quantities']) else 1
            service_state = ServiceState(
                stripe_id=new_pay.id,
                client_id=user_id,
                profesional_id=professional_user_id,
                service_id=service_id,
                status='pending',
                hours=service_hours
            )
            db.session.add(service_state)
            service_states_created.append(service_state.serialize())
        db.session.commit()

        return jsonify({'message': 'Pago registrado correctamente', 'stripe_pay': new_pay.serialize(), 'service_states': service_states_created}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


