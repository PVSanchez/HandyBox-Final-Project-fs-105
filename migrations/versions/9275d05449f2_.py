"""empty message

Revision ID: 9275d05449f2
Revises: e4b167263d53
Create Date: 2025-07-18 18:14:07.629215

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9275d05449f2'
down_revision = 'e4b167263d53'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('rol', schema=None) as batch_op:
        batch_op.drop_column('type')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('rol', schema=None) as batch_op:
        batch_op.add_column(sa.Column('type', postgresql.ENUM('client', 'professional', name='role'), autoincrement=False, nullable=False))

    # ### end Alembic commands ###
