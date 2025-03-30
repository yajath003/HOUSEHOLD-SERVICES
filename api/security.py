from flask_security import SQLAlchemyUserDatastore
from api.models import db, User, Role

# Initialize the datastore
datastore = SQLAlchemyUserDatastore(db, User, Role)
