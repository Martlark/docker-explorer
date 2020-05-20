"""empty message

Revision ID: 59264cbeb7c3
Revises: fdb210abb109
Create Date: 2020-05-19 19:04:28.156674

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '59264cbeb7c3'
down_revision = 'fdb210abb109'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('command',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cmd', sa.String(length=4000), nullable=True),
    sa.Column('result', sa.String(length=4000), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.Column('updated', sa.DateTime(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('command')
    # ### end Alembic commands ###
