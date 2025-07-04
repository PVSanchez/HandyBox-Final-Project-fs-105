from sqlalchemy import ForeignKey, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database.db import db
import datetime



class ServiceState(db.Model):

    __tablename__="serviceState"

    id: Mapped[int] = mapped_column(primary_key=True)
    stripe_id: Mapped[int] = mapped_column(ForeignKey("stripe_pay.id"), nullable=False)
    client_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    profesional_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("service.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(120), default='pending', nullable=False)
    date_register: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.now)
    date_modify: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.now, onupdate=datetime.datetime.now)
    hours: Mapped[int] = mapped_column(default=1, nullable=False)

    client = relationship("User", foreign_keys=[client_id])
    profesional = relationship("User", foreign_keys=[profesional_id])
    service = relationship("Service", foreign_keys=[service_id])

    def serialize(self):
        return{
           "id": self.id,
           "stripe_id": self.stripe_id,
           "client_id": self.client_id,
           "client": self.client.serialize() if self.client else None,
           "profesional_id": self.profesional_id,
           "profesional": self.profesional.serialize() if self.profesional else None,
           "service_id": self.service_id,
           "service": self.service.serialize() if self.service else None,
           "status": self.status,
           "hours": self.hours,
           "date_register": self.date_register,
           "date_modify": self.date_modify
        }
