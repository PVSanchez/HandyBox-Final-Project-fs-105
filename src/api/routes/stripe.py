import os
import stripe
from flask_jwt_extended import jwt_required
from flask_cors import CORS
from flask import Blueprint, request
from api.database.db import db



stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

api = Blueprint('api/payment', __name__)
CORS(api)


@api.route('/create-payment', methods=["POST"])
@jwt_required()
def create_payment():
    response_body = {"success": False}
    try:
        data = request.json
       
        if not data or "amount" not in data or "currency" not in data:
            response_body["error"] = "Faltan campos obligatorios: amount y currency."
            return response_body, 400
       
        amount = int(data["amount"])
        currency = str(data["currency"])
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            automatic_payment_methods={'enabled': True}
        )
        response_body["client_secret"] = intent["client_secret"]
        response_body["success"] = True
        return response_body, 200
    except Exception as e:
        response_body["error"] = str(e)
        return response_body, 403