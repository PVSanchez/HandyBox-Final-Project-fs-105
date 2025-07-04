from api.database.db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, ForeignKey


class UserDetail(db.Model):
    __tablename__ = "user_detail"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), unique=True, nullable=False)
    acerca_de_mi: Mapped[str] = mapped_column(Text, nullable=True)
    experiencia_laboral: Mapped[str] = mapped_column(Text, nullable=True)
    portfolio: Mapped[str] = mapped_column(Text, nullable=True)
    video: Mapped[str] = mapped_column(String(500), nullable=True)

    user = relationship("User", backref="user_detail", uselist=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "acerca_de_mi": self.acerca_de_mi,
            "experiencia_laboral": self.experiencia_laboral,
            "portfolio": self.portfolio,
            "video":self.video,
            "user": self.user.serialize() if self.user else None
        }
