from flask import Blueprint, jsonify, render_template, request, current_app, session
from flask_security import auth_required, roles_required
from werkzeug.utils import secure_filename
from api.models import db, User
from admin.models import Services
from employee.models import Employee
import logging
import os

admin_app = Blueprint('admin_app', __name__)

def allowed_file(filename):
    allowed_extensions = {"jpg", "jpeg", "png"}
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


@admin_app.get('/admin_dashboard')
# @auth_required('token')
# @roles_required('admin')
def admin_dashboard():
    services = Services.query.all()
    services_list = [{"id": s.id, "name": s.name, "description": s.description, "price": s.price, "image": s.image} for
                     s in services]

    employees = Employee.query.all()
    employees_list = []
    waitlisted_employees = []

    for employee in employees:
        user = User.query.get(employee.user_id)
        if user and user.active:
            employees_list.append(
                {"emp_id": employee.employee_id, "name": employee.employee_name, "service": employee.service})
        else:
            waitlisted_employees.append(
                {"emp_id": employee.employee_id, "name": employee.employee_name, "service": employee.service})

    non_employee_users = User.query.filter(
        User.name != 'admin',
        ~User.id.in_(db.session.query(Employee.user_id))
    ).all()

    users_list = [{"id": user.id, "name": user.name, "active": user.active} for user in non_employee_users]

    response_data = [services_list, employees_list, waitlisted_employees, users_list]

    if request.headers.get("Accept") == "application/json":
        return jsonify(response_data)
    return render_template("index.html")


@admin_app.post('/new_service')
# @auth_required('token_name')
# @roles_required('admin')
def new_service():
    service_name = request.form.get('service_name')
    description = request.form.get('description')
    price = request.form.get('price')
    type = request.form.get('type')
    image = request.files.get('image')
    image_filename = None
    
    if not all([service_name, description, price, type]):
        return jsonify({"error": "All fields are required"}), 400
    
    if image and allowed_file(image.filename):
        image_filename = secure_filename(image.filename)
        image.save(os.path.join(current_app.config["UPLOAD_IMAGE_FOLDER"], image_filename))
    else:
        return jsonify({"error": "Invalid or missing proof file"}), 400
    try:
        price = float(price)
        if price <= 0:
            return jsonify({"error": "Price must be greater than zero"}), 400
    except ValueError:
        return jsonify({"error": "Invalid price format"}), 400
    service = Services(name=service_name, description=description, price=price, image=image_filename)
    print("hello 123")
    try:
        db.session.add(service)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logging.error(f"Database error: {e}")
        return jsonify({"error": "An error occurred while adding the service"}), 500

    return jsonify({"message": "Service added successfully!"}), 201


@admin_app.route('/get_employee/<int:emp_id>')
def get_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    response_data = {
        "emp_id": employee.employee_id,
        "name": employee.employee_name,
        "service": employee.service,
        "email": employee.email,
        "documents": employee.proof.split(',') if employee.proof else [],
        "experience": employee.experience
    }

    if request.headers.get("Accept") == "application/json":
        return jsonify(response_data)

    return render_template("index.html")


@admin_app.route('/approve_employee/<int:emp_id>', methods=['POST'])
def approve_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    user = User.query.get(employee.user_id)
    if user:
        user.active = True
        db.session.commit()
        return jsonify({"message": "Employee approved successfully"})

    return jsonify({"error": "User not found"}), 404


@admin_app.route('/reject_employee/<int:emp_id>', methods=['POST'])
def reject_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    try:
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"message": "Employee rejected successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_app.route('/deactivate_employee/<int:emp_id>', methods=['POST'])
def deactivate_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    user = User.query.get(employee.user_id)
    if user:
        try:
            user.active = False
            db.session.commit()
            return jsonify({"message": "Employee moved to waitlist successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "User not found"}), 404


@admin_app.route('/get_service/<int:service_id>')
def get_service(service_id):
    service = Services.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    return jsonify({
        "id": service.id,
        "name": service.name,
        "description": service.description,
        "price": service.price,
        "image": service.image
    })


@admin_app.route('/upload_service_image', methods=['POST'])
def upload_service_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(current_app.config['UPLOAD_IMAGE_FOLDER'], filename))
        return jsonify({"filename": filename})

    return jsonify({"error": "Invalid file type"}), 400


@admin_app.route('/update_service/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    service = Services.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404
    try:
        # Check content type first
        if not request.is_json:
            return jsonify({"error": "Missing JSON in request"}), 415
            
        data = request.get_json()
        print("Received data:", data)  # Debug log
        
        service.name = data.get('name', service.name)
        service.description = data.get('description', service.description)
        service.price = data.get('price', service.price)
        service.image = data.get('image', service.image)
        
        db.session.commit()
        return jsonify({"message": "Service updated successfully"})
    except Exception as e:
        db.session.rollback()
        print(f"Update error: {str(e)}")  # Detailed error logging
        return jsonify({"error": "Server error: " + str(e)}), 500


# Flask routes
@admin_app.get('/user_details/<int:user_id>')
#@auth_required()
#@roles_required('admin')
def get_user_details(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "active": user.active,
        "address": user.address,
        "pin": user.pin,
    })


@admin_app.put('/toggle_user_status/<int:user_id>')
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    user.active = not user.active
    db.session.commit()

    response_data = {
        "message": "Status updated successfully",
        "new_status": user.active
    }

    if request.headers.get("Accept") == "application/json":
        return jsonify(response_data)

    return render_template("index.html")


@admin_app.get('/admin_search')
# @auth_required('token')
# @roles_required('admin')
def admin_search():
    query = request.args.get('q', '').lower()
    if not query:
        return admin_dashboard()  # Return all data if no query

    # Search Services
    services = Services.query.filter(
        db.or_(
            Services.name.ilike(f'%{query}%'),
            Services.description.ilike(f'%{query}%')
        )
    ).all()
    services_list = [{"id": s.id, "name": s.name, "description": s.description, "price": s.price, "image": s.image}
                     for s in services]

    # Search Employees (both approved and waitlisted)
    employees = Employee.query.join(User).filter(
        db.or_(
            Employee.employee_name.ilike(f'%{query}%'),
            Employee.service.ilike(f'%{query}%'),
            Employee.email.ilike(f'%{query}%')
        )
    ).all()

    employees_list = []
    waitlisted_employees = []

    for employee in employees:
        user = User.query.get(employee.user_id)
        emp_data = {
            "emp_id": employee.employee_id,
            "name": employee.employee_name,
            "service": employee.service
        }
        if user and user.active:
            employees_list.append(emp_data)
        else:
            waitlisted_employees.append(emp_data)

    # Search Users (non-employees)
    non_employee_users = User.query.filter(
        User.name != 'admin',
        ~User.id.in_(db.session.query(Employee.user_id)),
        db.or_(
            User.name.ilike(f'%{query}%'),
            User.email.ilike(f'%{query}%')
        )
    ).all()
    users_list = [{"id": user.id, "name": user.name, "active": user.active} for user in non_employee_users]

    response_data = [services_list, employees_list, waitlisted_employees, users_list]

    return jsonify(response_data)


@admin_app.route('/admin_summary')
def summary_stats():
    # Employee statistics
    employees_total = Employee.query.count()
    employees_active = db.session.query(Employee).join(User).filter(User.active == True).count()
    employees_inactive = employees_total - employees_active

    # Regular user statistics (non-employee)
    non_employee_users_total = User.query.filter(
        User.name != 'admin',
        ~User.id.in_(db.session.query(Employee.user_id))
    ).count()
    
    non_employee_active = User.query.filter(
        User.name != 'admin',
        ~User.id.in_(db.session.query(Employee.user_id)),
        User.active == True
    ).count()
    non_employee_inactive = non_employee_users_total - non_employee_active

    # Service statistics
    services_total = Services.query.count()
    active_services = db.session.query(Services).join(
        Employee, Services.name == Employee.service
    ).join(User).filter(
        User.active == True
    ).distinct().count()
    services_inactive = services_total - active_services

    return jsonify([
        {
            "category": "Employees",
            "total": employees_total,
            "active": employees_active,
            "inactive": employees_inactive
        },
        {
            "category": "Users",
            "total": non_employee_users_total,
            "active": non_employee_active,
            "inactive": non_employee_inactive
        },
        {
            "category": "Services",
            "total": services_total,
            "active": active_services,
            "inactive": services_inactive
        }
    ])