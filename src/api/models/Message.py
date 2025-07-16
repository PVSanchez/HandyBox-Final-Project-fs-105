from api.database.db import db
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from api.models.User import User


class Message(db.Model):
    __tablename__ = 'message'

    id: Mapped[int] = mapped_column(primary_key=True)
    room: Mapped[str] = mapped_column(String(120), nullable=False)
    sender_id: Mapped[int] = mapped_column(
        ForeignKey('user.id'), nullable=False)
    service_id: Mapped[int] = mapped_column(
        ForeignKey('service.id'), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now)
    is_read: Mapped[bool] = mapped_column(db.Boolean, default=False)

    sender = relationship('User', foreign_keys=[
                          sender_id], backref='messages_sent')
    service = relationship('Service', foreign_keys=[
                           service_id], backref='messages')

    def __repr__(self):
        return f'<Message {self.id}>'

    def serialize(self):
        user = User.query.get(self.sender_id)
        return {
            "id": self.id,
            "room": self.room,
            "sender_id": self.sender_id,
            "service_id": self.service_id,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "is_read": self.is_read,
            "user_name": user.user_name if user else None,
            "first_name": user.first_name if user else None,
            "last_name": user.last_name if user else None,
            "sender_role": user.rol.type.value if user and user.rol else None
        }
