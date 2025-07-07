from sqlalchemy import String, Float, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database.db import db

class Service(db.Model):

    __tablename__="service"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    img: Mapped[str] = mapped_column(String(255), nullable=True)
    video: Mapped[str] = mapped_column(String(500), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    url: Mapped[str] = mapped_column(String(120), nullable=True)
    rate: Mapped[float] = mapped_column(Float, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, nullable=True, default=True)

    user = relationship("User")
    ratings = relationship("Rate", back_populates="service", cascade="all, delete-orphan")

    def serialize(self):
        return{
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "img": self.img,
            "video":self.video,
            "price": self.price,
            "url": self.url,
            "rate": self.rate,
            "user_id": self.user_id,
            "user": self.user.serialize() if self.user else None,
            "status": self.status
        }