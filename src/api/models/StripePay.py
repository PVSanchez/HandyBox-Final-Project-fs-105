from api.database.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Float, DateTime, ForeignKey
import datetime


class StripePay(db.Model):
    __tablename__ = "stripe_pay"

    id: Mapped[int] = mapped_column(primary_key=True)
    stripe_payment_id: Mapped[str] = mapped_column(String(120), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    service_ids: Mapped[str] = mapped_column(String(255), nullable=False)
    service_quantities: Mapped[str] = mapped_column(
        String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.datetime.now)

    user = relationship("User")

    def serialize(self):
        return {
            "id": self.id,
            "stripe_payment_id": self.stripe_payment_id,
            "user_id": self.user_id,
            "service_ids": self.service_ids.split(",") if self.service_ids else [],
            "service_quantities": [int(quantitie) for quantitie in self.service_quantities.split(",")] if self.service_quantities else [],
            "amount": self.amount,
            "currency": self.currency,
            "created_at": self.created_at,
            "user": self.user.serialize() if self.user else None
        }
