from flask import Blueprint, jsonify, request, session, render_template
from flask_security import auth_required, roles_required, current_user
from api.models import db, User, Role
from employee.models import Employee, Rating
from admin.models import Services
from user.models import Bookings
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from datetime import datetime
employee_app = Blueprint('employee_app', __name__)


# Existing endpoint remains unchanged
@employee_app.get('/employee_dashboard')
# @auth_required()
# @roles_required('employee')
def employee_dashboard():
    response_data = {"message": "Welcome, Employee!"}
    if request.headers.get("Accept") == "application/json":
        return jsonify(response_data)
    return render_template("index.html")


@employee_app.route('/profile', methods=['GET'])
# @auth_required()
# @roles_required('employee')
def employee_profile():
    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee profile not found"}), 404

        response_data = {
            "id": employee.employee_id,
            "name": employee.employee_name,
            "service": employee.service,
            "experience": employee.experience
        }
        if request.headers.get("Accept") == "application/json":
            return jsonify(response_data)

        return render_template("index.html")

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@employee_app.route('/emp_bookings', methods=['GET'])
# @auth_required()
# @roles_required('employee')
def get_service_bookings():
    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        bookings = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(Services.name == employee.service) \
            .all()
        result = []
        for booking in bookings:
            serv = Services.query.filter_by(id=booking.s_id).first()
            result.append({
                "id": booking.id,
                "u_id": booking.u_id,
                "status": booking.status,
                "date": booking.date_of_request.isoformat(),
                "service": {
                    "id": serv.id,
                    "name": serv.name,
                    "image": serv.image,
                    "price": serv.price,
                    "description": serv.description
                }
            })

        if request.headers.get("Accept") == "application/json":
            return jsonify(result)

        return render_template("index.html")

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@employee_app.route('/bookings/<int:booking_id>/status', methods=['PUT'])
# @auth_required()
# @roles_required('employee')
def update_booking_status(booking_id):
    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        # Verify the booking belongs to the employee's service
        booking = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(
            Bookings.id == booking_id,
            Services.name == employee.service
        ) \
            .first()

        if not booking:
            return jsonify({"error": "Booking not found or unauthorized access"}), 404

        data = request.get_json()
        new_status = data.get('status')

        if new_status not in ['Accepted', 'Rejected', 'Closed']:
            return jsonify({"error": "Invalid status"}), 400

        if booking.status == 'Closed':
            return jsonify({"error": "Closed bookings cannot be modified"}), 400

        booking.status = new_status
        booking.e_id = employee.employee_id
        db.session.commit()

        return jsonify({
            "message": "Request accepted successfully",
            "new_status": new_status
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@employee_app.route('/emp_request_details/<int:booking_id>', methods=['GET'])
def request_details(booking_id):
    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        booking = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(
                Bookings.id == booking_id,
                Services.name == employee.service
            ).first()

        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        service = Services.query.get(booking.s_id)
        user = User.query.get(booking.u_id)

        return jsonify({
            "id": booking.id,
            "u_id": booking.u_id,
            "status": booking.status,
            "date": booking.date_of_request.isoformat(),
            "service": {
                "id": service.id,
                "name": service.name,
                "image": service.image,
                "price": service.price,
                "description": service.description
            },
            "user_details": {
                "address": user.address,
                "pin": user.pin
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@employee_app.route('/emp_my_services', methods=['GET'])
# @auth_required()
# @roles_required('employee')
def get_employee_services():
    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        services = Bookings.query\
            .join(Services, Bookings.s_id == Services.id)\
            .filter(
                Bookings.e_id == employee.employee_id,
                Bookings.status.in_(['Accepted', 'Closed'])
            )\
            .all()
        result = []
        for booking in services:
            service = Services.query.get(booking.s_id)
            result.append({
                "id": booking.id,
                "status": booking.status,
                "completion_date": booking.date_of_completion.isoformat() if booking.date_of_completion else None,
                "service": {
                    "id": service.id,
                    "name": service.name,
                    "image": service.image,
                    "price": service.price,
                    "description": service.description
                }
            })
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@employee_app.route('/bookings/<int:booking_id>/complete', methods=['PUT'])
def complete_service(booking_id):
    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        booking = Bookings.query.filter_by(
            id=booking_id,
            e_id=employee.employee_id,
            status='Accepted'
        ).first()
        if not booking:
            return jsonify({"error": "Valid service not found"}), 404

        booking.status = 'Completed'
        booking.date_of_completion = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "message": "Service completed successfully",
            "completion_date": booking.date_of_completion.isoformat()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@employee_app.route('/my_serv_det/<int:booking_id>', methods=['GET'])
# @auth_required()
# @roles_required('employee')
def get_my_service_details(booking_id):
    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        booking = Bookings.query.filter_by(
            id=booking_id,
            e_id=employee.employee_id
        ).first()

        if not booking:
            return jsonify({"error": "Service not found"}), 404

        service = Services.query.get(booking.s_id)
        user = User.query.get(booking.u_id)

        return jsonify({
            "id": booking.id,
            "status": booking.status,
            "date": booking.date_of_request.isoformat(),
            "completion_date": booking.date_of_completion.isoformat() if booking.date_of_completion else None,
            "service": {
                "id": service.id,
                "name": service.name,
                "image": service.image,
                "price": service.price,
                "description": service.description
            },
            "user_details": {
                "address": user.address,
                "pin": user.pin
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@employee_app.route('/emp_search', methods=['GET'])
# @auth_required()
# @roles_required('employee')
def employee_search():
    query = request.args.get('q', '').lower()
    if not query:
        # If no query, return all bookings and services
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        bookings_result = get_service_bookings().get_json()
        my_services_result = get_employee_services().get_json()
        return jsonify({"bookings": bookings_result, "my_services": my_services_result})

    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        # Search Bookings
        bookings = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(
            Services.name == employee.service,
            db.or_(
                Services.name.ilike(f'%{query}%'),
                Services.description.ilike(f'%{query}%')
            )
        ).all()
        bookings_result = []
        for booking in bookings:
            serv = Services.query.filter_by(id=booking.s_id).first()
            bookings_result.append({
                "id": booking.id,
                "u_id": booking.u_id,
                "status": booking.status,
                "date": booking.date_of_request.isoformat(),
                "service": {
                    "id": serv.id,
                    "name": serv.name,
                    "image": serv.image,
                    "price": serv.price,
                    "description": serv.description
                }
            })

        # Search My Services
        my_services = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(
            Bookings.e_id == employee.employee_id,
            Bookings.status.in_(['Accepted', 'Closed']),
            db.or_(
                Services.name.ilike(f'%{query}%'),
                Services.description.ilike(f'%{query}%')
            )
        ).all()
        my_services_result = []
        for booking in my_services:
            service = Services.query.get(booking.s_id)
            my_services_result.append({
                "id": booking.id,
                "status": booking.status,
                "completion_date": booking.date_of_completion.isoformat() if booking.date_of_completion else None,
                "service": {
                    "id": service.id,
                    "name": service.name,
                    "image": service.image,
                    "price": service.price,
                    "description": service.description
                }
            })

        return jsonify({
            "bookings": bookings_result,
            "my_services": my_services_result
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Add this to employee.views (at the end of the file)

@employee_app.route('/employee_summary', methods=['GET'])
# @auth_required()
# @roles_required('employee')
def employee_summary():
    try:
        employee = Employee.query.filter_by(user_id=session['user_id']).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        # Get service count and earnings
        completed_services = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(
                Bookings.e_id == employee.employee_id,
                Bookings.status == 'Completed'
            ).all()

        total_earnings = sum(service.price for booking in completed_services 
                           for service in [Services.query.get(booking.s_id)])

        # Get booking status counts
        bookings = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(Services.name == employee.service).all()

        status_counts = {
            'Pending': 0,
            'Accepted': 0,
            'Completed': 0,
            'Rejected': 0,
            'Closed': 0
        }
        for booking in bookings:
            status_counts[booking.status] += 1

        summary_data = [
            {
                "category": "Services",
                "total": len(completed_services),
                "earnings": total_earnings
            },
            {
                "category": "Bookings",
                "counts": status_counts
            }
        ]

        return jsonify(summary_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500