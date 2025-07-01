from flask import Blueprint, request, jsonify
from api.models.Rate import Rate
from api.models.Service import Service
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.database.db import db
from flask_cors import CORS

api = Blueprint("api/rate", __name__)
CORS(api)


@api.route("/", methods=["GET"])
def get_rates():

    all_rates = Rate.query.all()
    all_rate_serialize = list(map(lambda rate: rate.serialize(), all_rates))
    return jsonify(all_rate_serialize), 200


@api.route("/service/<int:service_id>", methods=["GET"])
def get_rates_by_service_id(service_id):

    current_service = Service.query.get(service_id)

    if not current_service:
        return jsonify({'error': 'Servicio no encontrado'}), 400
    
    rates_service = Rate.query.filter_by(service_id=service_id).all()
    rates_serialized = list(
        map(lambda rate: rate.serialize(), rates_service))
    
    return jsonify(rates_serialized), 200


@api.route("/post", methods=["POST"])
@jwt_required()
def create_rate():
    data = request.get_json()

    required_fields = ['stripe_id', 'client_id', 'client_rate', 'service_id']

    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Falta el campo {field}'}), 400

    try:
        new_rate = Rate(
            stripe_id=data["stripe_id"],
            client_id=data["client_id"],
            service_id=data["service_id"],
            client_rate=data["client_rate"],
            comment=data["comment"]
        )
        db.session.add(new_rate)
        db.session.commit()

        # Obtener todas las valoraciones del servicio
        ratings = Rate.query.filter_by(service_id=data['service_id']).all()

        # Calcular el nuevo promedio
        average_rate = sum(r.client_rate for r in ratings) / len(ratings)

        # Actualizar el servicio con el nuevo promedio
        service = Service.query.get(data['service_id'])
        if not service:
            return jsonify({"error": "Service not found"}), 404

        service.rate = round(average_rate, 2)
        db.session.commit()

        return jsonify(new_rate.serialize()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@api.route("/put/<int:service_id>", methods=["PUT"])
@jwt_required()
def update_rate(service_id):
    data = request.get_json()

    user_id = get_jwt_identity()

    rate = Rate.query.filter_by(service_id=service_id, client_id=user_id).first()

    if not rate:
        return jsonify({'error': 'No existe esa valoración'}), 404
    
    rate.comment = data.get('comment', rate.comment)

    try:
        db.session.commit()
        return jsonify(rate.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
