from flask_sqlalchemy import SQLAlchemy
from flask_security import RoleMixin, UserMixin

db = SQLAlchemy()

class Role(db.Model, RoleMixin):
    __tablename__ = "role"  # Changed to lowercase
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    __tablename__ = "user"  # Changed to lowercase
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship("Role", secondary="user_roles", backref=db.backref("users", lazy="dynamic"))
    address = db.Column(db.String(300), nullable=False)
    pin = db.Column(db.Integer, nullable=False)

user_roles = db.Table(
    "user_roles",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),  # Changed to lowercase
    db.Column("role_id", db.Integer, db.ForeignKey("role.id")),  # Changed to lowercase
)