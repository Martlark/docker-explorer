"""add group secondary table

Revision ID: 076558dbe5d3
Revises: 0b829e879cdb
Create Date: 2021-06-13 11:55:45.913200

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '076558d4335d3'
down_revision = '076558dbe5d3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('server_group_user',
    sa.Column('server_group_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('server_group_user')
    # ### end Alembic commands ###
