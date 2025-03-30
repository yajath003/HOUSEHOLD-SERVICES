from flask_sqlalchemy import SQLAlchemy
from application import db

class Employee(db.Model):
    __tablename__ = "employee"
    employee_id = db.Column(db.Integer, primary_key=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", name="fk_employee_user"), nullable=False)
    employee_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    service = db.Column(db.String(80), nullable=False)
    experience = db.Column(db.Integer, nullable=False)
    proof = db.Column(db.String(100), nullable=False)

class Rating(db.Model):
    __tablename__ = "rating"
    rating_id = db.Column(db.Integer, primary_key=True, nullable=False)
    b_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    e_id = db.Column(db.Integer, db.ForeignKey("employee.employee_id"), nullable=False)
    rating = db.Column(db.Integer, default=3, nullable=False)
    comments = db.Column(db.String(200))
    bookings = db.relationship("Bookings", backref="rating")
    employee = db.relationship("Employee", backref="employee")