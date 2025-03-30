from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore
from flask_migrate import Migrate
import os

db = SQLAlchemy()
migrate = Migrate()

from api.models import *
def create_app():
    app = Flask(__name__)

    basedir = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(basedir, "static", "uploads")
    UPLOAD_IMAGE_FOLDER  =os.path.join(basedir, "static", "images")
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///" + os.path.join(basedir, "database.sqlite3")
    app.config['SECRET_KEY'] = "you-will-never-guess"
    app.config['SECURITY_PASSWORD_SALT'] = "146585145368132386173505678016728509634"
    app.config["SECURITY_TOKEN_AUTHENTICATION_HEADER"] = "Authorization"
    app.config["SECURITY_TOKEN_AUTHENTICATION_KEY"] = "auth_token"
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
    app.config["UPLOAD_IMAGE_FOLDER"] = UPLOAD_IMAGE_FOLDER

    # Initialize the database
    db.init_app(app)

    # Initialize Flask-Migrate
    migrate.init_app(app, db)  # Link Migrate to the app and db

    # Initialize the User Datastore and Security
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    security = Security(app, datastore)

    return app