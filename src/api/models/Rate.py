from api.database.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String , ForeignKey, Float



class Rate(db.Model):
    __tablename__ = "rate"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_client: Mapped[str] = mapped_column(ForeignKey("User.user_name"))
    name_service: Mapped[str] = mapped_column(ForeignKey("Service.name"))
    rate: Mapped[int] = mapped_column(Float, nullable=False)
    
    
    

    def serialize(self):
        return {
            "id": self.id,
            
        }