# create_roles.py
from application import create_app, db
from api.models import Role

app = create_app()

with app.app_context():
    # Create roles
    roles = ['admin', 'employee', 'user']
    for role_name in roles:
        role = Role(name=role_name)
        db.session.add(role)
    db.session.commit()
    print("Roles created successfully!")