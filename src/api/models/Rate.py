from api.database.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Float, Text


class Rate(db.Model):

    __tablename__ = "rate"

    id: Mapped[int] = mapped_column(primary_key=True)
    stripe_id: Mapped[int] = mapped_column(ForeignKey("stripe_pay.id"), nullable=False)
    client_id: Mapped[str] = mapped_column(ForeignKey("user.id"))
    service_id: Mapped[str] = mapped_column(ForeignKey("service.id"))
    client_rate: Mapped[int] = mapped_column(Float, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)

    client = relationship("User")
    service = relationship("Service", back_populates="ratings")

    def serialize(self):
        return {
            "id": self.id,
            "stripe_id": self.stripe_id,
            "client_id": self.client_id,
            "service_id": self.service_id,
            "client_rate": self.client_rate,
            "comment": self.comment,
            "client": self.client.serialize() if self.client else None
        }
