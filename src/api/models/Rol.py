from api.database.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import  Enum
import enum

class Role(enum.Enum): 
    client = "client",
    professional = "professional"


class Rol(db.Model):
    __tablename__ = "rol"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[Role] = mapped_column(Enum(Role))
    
   
    users = relationship("User", back_populates="rol")

    def serialize(self):
        return {
            "id": self.id,
            "type": self.type.value[0] if self.type else None
        }