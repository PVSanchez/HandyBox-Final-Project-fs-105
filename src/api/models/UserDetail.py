from api.database.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, ForeignKey

class UserDetail(db.Model):
    __tablename__ = "user_detail"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    preparation: Mapped[str] = mapped_column(Text, nullable=True)
    CV: Mapped[str] = mapped_column(String(500), nullable=True)
    portfolio: Mapped[str] = mapped_column(Text, nullable=True)


    user = relationship("User", backref="user_detail", uselist=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "description": self.description,
            "preparation": self.preparation,
            "CV": self.CV,
            "portfolio": self.portfolio,
            "user": self.user.serialize() if self.user else None
        }
