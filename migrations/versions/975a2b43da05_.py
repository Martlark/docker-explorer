"""empty message

Revision ID: 975a2b43da05
Revises: 
Create Date: 2020-01-21 20:30:01.940592

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '975a2b43da05'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('role',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=True),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('setting',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('setting_type', sa.String(length=120), nullable=True),
    sa.Column('key', sa.String(length=120), nullable=True),
    sa.Column('value', sa.String(length=2000), nullable=True),
    sa.Column('active', sa.String(length=1), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.Column('updated', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_setting_key'), 'setting', ['key'], unique=False)
    op.create_index(op.f('ix_setting_setting_type'), 'setting', ['setting_type'], unique=False)
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('password', sa.String(length=255), nullable=True),
    sa.Column('active', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('roles_users',
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('role_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['role_id'], ['role.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], )
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('roles_users')
    op.drop_table('user')
    op.drop_index(op.f('ix_setting_setting_type'), table_name='setting')
    op.drop_index(op.f('ix_setting_key'), table_name='setting')
    op.drop_table('setting')
    op.drop_table('role')
    # ### end Alembic commands ###
