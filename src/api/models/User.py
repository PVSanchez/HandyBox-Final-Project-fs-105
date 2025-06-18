from api.database.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String , DateTime, ForeignKey
import datetime


class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(120),  nullable=False)
    last_name: Mapped[str] = mapped_column(String(120),  nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    date: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    rol_id: Mapped[int] = mapped_column(ForeignKey("rol.id"))
    img: Mapped[str] = mapped_column(String(500),  nullable=True)
    
    
    rol = relationship("Rol", back_populates="users")

    def serialize(self):
        return {
            "id": self.id,
            "user_name": self.user_name,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "date": self.date,
            "rol_id": self.rol_id,
            "rol": self.rol.serialize() if self.rol else None,
            "img": self.img
        }