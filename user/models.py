from flask_sqlalchemy import SQLAlchemy
from application import db
from datetime import datetime

class Bookings(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    u_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    e_id = db.Column(db.Integer, default=0, nullable=False)
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime, default=None)
    status = db.Column(db.String(80), nullable=False)
    s_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)

    user = db.relationship("User", backref="bookings")
    services = db.relationship("Services", backref="bookings")
