from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy import MetaData
from sqlalchemy.dialects.postgresql import ARRAY

metadata = MetaData(naming_convention={
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_`%(constraint_name)s`",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
})
app = Flask(__name__)
bcrypt = Bcrypt(app)
db = SQLAlchemy(metadata=metadata)


class Users(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(), unique=True)
    email = db.Column(db.String())
    is_active = db.Column(db.Boolean(), default=True)
    _password_hash = db.Column(db.String())

    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        if password is not None:
            password_hash = bcrypt.generate_password_hash(
                password.encode('utf-8'))
            self._password_hash = password_hash.decode('utf-8')
        else:
            raise ValueError("Password cannot be None")

    def authenticate(self, password):
        if password is not None:
            return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))
        else:
            return False


class Folders(db.Model, SerializerMixin):
    __tablename__ = 'folders'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)


class Blocks(db.Model):
    __tablename__ = 'blocks'
    id = db.Column(db.Integer, primary_key=True)
    blocks = db.Column(ARRAY(db.String()))
    time = db.Column(db.BigInteger, nullable=False)
    version = db.Column(db.String(), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    folder_id = db.Column(db.Integer, db.ForeignKey('folders.id'))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())


class Templates(db.Model, SerializerMixin):
    __tablename__ = 'templates'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), unique=True, nullable=False)
    fields = db.Column(db.String())
    formatting = db.Column(db.String())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
