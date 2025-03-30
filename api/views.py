from flask import Blueprint, jsonify, request, render_template, current_app, session, send_from_directory, send_file
from flask_security import auth_required, roles_required
from werkzeug.security import generate_password_hash, check_password_hash
from api.models import User, db, Role
from employee.models import Employee
from admin.models import Services
from api.security import datastore
import uuid
import os
from werkzeug.utils import secure_filename
from celery.result import AsyncResult
from task import csv_report
from celery import Celery
api_app = Blueprint('api_app', __name__)

@api_app.route("/", defaults={"path": ""})
@api_app.route("/<path:path>")
def home(path):
    return render_template("index.html")  # Vue will handle routing

ALLOWED_EXTENSIONS = {"pdf"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@api_app.route('/register', methods=['POST'])
def register():
    print("hiiiii")
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')
    role_name = request.form.get('role')
    service = request.form.get('service')
    experience = request.form.get('experience')
    address = request.form.get('address')
    pin = request.form.get('pin')
    proof = request.files.get('proof')
    proof_filename = None
    services_list=[]
    if (role_name != "employee"):
        if not all([name, email, password, role_name, address, pin]):
            return jsonify({"error": "All fields are required"}), 400

        hashed_password = generate_password_hash(password)
        user = User(name=name, email=email, password=hashed_password, active=True, fs_uniquifier=str(uuid.uuid4()), address=address, pin=pin)

        role = Role.query.filter_by(name=role_name).first()
        if not role:
            return jsonify({"error": "Invalid role"}), 400

        user.roles.append(role)

        try:
            db.session.add(user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error occurred: {e}")
            return jsonify({"error": "An error occurred while registering the user."}), 500
        return jsonify({"message": "User  registered successfully"}), 201
    else:

        if not all([name, email, password, role_name, service, address, pin, experience]):
            return jsonify({"error": "All fields are required"}), 400
        if proof and allowed_file(proof.filename):
            proof_filename = secure_filename(proof.filename)
            proof.save(os.path.join(current_app.config["UPLOAD_FOLDER"], proof_filename))
        else:
            return jsonify({"error": "Invalid or missing proof file"}), 400
        hashed_password = generate_password_hash(password)
        user = User(name=name, email=email, password=hashed_password, active=False, fs_uniquifier=str(uuid.uuid4()), address=address, pin=pin)
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            return jsonify({"error": "Invalid role"}), 400
        user.roles.append(role)

        try:
            db.session.add(user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error occurred: {e}")
            return jsonify({"error": "An error occurred while registering the user."}), 500
        user = User.query.filter_by(email=email).first()
        user_id = user.id
        employee = Employee(user_id=user_id, employee_name=name, email=email, service=service, experience=experience, proof=proof_filename)
        try:
            db.session.add(employee)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error occurred: {e}")
            return jsonify({"error": "An error occurred while registering the user."}), 500
        return jsonify({"message": "Employee regestered. Wait until admin aproves you"}), 201



@api_app.get('/services')
def get_services():
    services = Services.query.all()
    services_list = [{"name": service.name} for service in services]
    return jsonify({"services": services_list})


@api_app.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'GET':
        return render_template("index.html")  # Let Vue handle the signin page

    try:
        data = request.get_json()  # Ensures correct JSON handling
        email = data.get('email')
        if not email:
            return jsonify({"error": "Email not provided"}), 400
        user = datastore.find_user(email=email)
        if not user:
            return jsonify({"error": "User not found"}), 400
        if check_password_hash(user.password, data.get("password")):
            if user.active:
                session['user_id'] = user.id
                return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name})
            else:
                return jsonify({"message": "Not Authorized by Admin"}), 400
        else:
            return jsonify({"error": "Wrong password"}), 400
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@api_app.route('/api/export/<int:employee_id>', methods=['GET'])
def export_csv(employee_id):
    # Start the Celery task and return ONLY the task ID
    result = csv_report.delay(employee_id)
    return jsonify({"task_id": result.id})  # Return task ID, not file URL


@api_app.route('/api/csv_result/<task_id>', methods=['GET'])
def csv_result(task_id):
    try:
        celery_app = current_app.extensions["celery"]
        result = AsyncResult(task_id, app=celery_app)
        if result.ready():
            if result.successful():
                file_data = result.result
                if "error" in file_data:
                    return jsonify({"error": file_data["error"]}), 400
                
                # Path should be relative to static directory
                static_dir = os.path.join(current_app.root_path, 'static')
                file_path = os.path.join(static_dir, file_data["file_url"])
                if not os.path.exists(file_path):
                    current_app.logger.error(f"File not found: {file_path}")
                    return jsonify({"error": "Report file not found"}), 404
                return send_from_directory(
                    static_dir,
                    file_data["file_url"],
                    as_attachment=True,
                    mimetype='text/csv',
                    download_name=file_data["file_url"].split('/')[-1]
                )
            return jsonify({"error": result.result.get("error", "Task failed")}), 500
        
        return jsonify({"status": "Processing"}), 202
    
    except Exception as e:
        current_app.logger.error(f"CSV retrieval error: {str(e)}")
        return jsonify({"error": "Server error"}), 500