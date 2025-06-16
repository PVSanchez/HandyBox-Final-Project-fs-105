from sqlalchemy import String, Enum, Float, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from api.database.db import db
import enum

class Media(enum.Enum): 
    image = "image",
    video = "video"

class Service(db.Model):

    __tablename__="service"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    media_type: Mapped[Media] = mapped_column(Enum(Media), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    url: Mapped[str] = mapped_column(String(120), nullable=True)
    rate: Mapped[float] = mapped_column(Float, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    def serialize(self):
        return{
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "media_type": self.media_type.value if self.media_type else None,
            "price": self.price,
            "url": self.url,
            "rate": self.rate,
            "user_id": self.user_id,
            "status": "active" if self.status else "inactive"
        }