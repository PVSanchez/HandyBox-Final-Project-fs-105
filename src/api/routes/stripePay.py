from flask import Blueprint, request, jsonify
from api.models.StripePay import StripePay
from api.models.Service import Service
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
        return jsonify({'message': 'Pago registrado correctamente', 'stripe_pay': new_pay.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/user', methods=['GET'])
@jwt_required()
def get_user_stripe_pays():
    user_id = get_jwt_identity()
    try:
        pagos = StripePay.query.filter_by(user_id=user_id).order_by(
            StripePay.created_at.desc()).all()
        return jsonify([pago.serialize() for pago in pagos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/professional', methods=['GET'])
@jwt_required()
def get_professional_services():
    user_id = get_jwt_identity()
    try:
        professional_services = Service.query.filter_by(user_id=user_id).all()
        professional_service_ids = set(str(service.id) for service in professional_services)
        if not professional_service_ids:
            return jsonify([]), 200
        all_payments = StripePay.query.order_by(StripePay.created_at.desc()).all()
        result = []
        for payment in all_payments:
            service_ids = payment.service_ids.split(',') if payment.service_ids else []
            service_quantities = [int(quantity) for quantity in payment.service_quantities.split(',')] if payment.service_quantities else []
            for idx, service_id in enumerate(service_ids):
                if service_id in professional_service_ids:
                    payment_data = payment.serialize()
                    payment_data['service_ids'] = [service_id]
                    payment_data['service_quantities'] = [service_quantities[idx] if idx < len(service_quantities) else 1]
                    result.append(payment_data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

