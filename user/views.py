from flask import Blueprint, jsonify, request, render_template, session
from flask_security import auth_required, roles_required
from werkzeug.security import generate_password_hash, check_password_hash
from api.models import User, db, Role
from admin.models import Services
from api.security import datastore
from user.models import Bookings
from employee.models import Employee, Rating
import uuid
user_app = Blueprint('user_app', __name__)

@user_app.route('/user_dashboard', methods=['GET'])
# @auth_required('token')
# @roles_required('user')
def user_dashboard():
    if request.headers.get("Accept") == "application/json":
        print("hoo")
        services = Services.query.all()
        services_list = [{"id": s.id, "name": s.name, "description": s.description, "price": s.price, "image": s.image} for s in services]
        return jsonify(services_list)
    return render_template("index.html")  # Let Vue handle rendering


@user_app.get('/serv_det/<int:service_id>')
def service_details(service_id):
    service = Services.query.get(service_id)

    if not service:
        return jsonify({"error": "Service not found"}), 404

    service_data = {
        "id": service.id,
        "name": service.name,
        "description": service.description,
        "price": service.price,
        "image": service.image
    }

    if request.headers.get("Accept") == "application/json":
        return jsonify(service_data)

    return render_template("index.html")


@user_app.route('/bookings', methods=['POST'])
def create_booking():
    try:
        current_user = User.query.filter_by(id=session.get('user_id')).first()
        if not current_user:
            return jsonify({'error': 'Invalid user in token'}), 401

        data = request.get_json()
        service_id = data.get('service_id')

        if not service_id:
            return jsonify({'error': 'Service ID is required'}), 400

        service = Services.query.get(service_id)
        if not service:
            return jsonify({'error': 'Service not found'}), 404

        employee = Employee.query.filter_by(service=service.name).first()
        if not employee:
            return jsonify({'error': 'No available staff for this service'}), 400

        new_booking = Bookings(
            u_id=session['user_id'],
            status='Pending',
            s_id=service_id
        )
        db.session.add(new_booking)
        db.session.commit()

        response_data = {
            'message': 'Service booked successfully',
            'booking_id': new_booking.id
        }

        if request.headers.get("Accept") == "application/json":
            return jsonify(response_data), 201

        return render_template("index.html")

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_app.route('/my_services', methods=['GET'])
def get_user_services():
    bookings = Bookings.query.filter_by(u_id=session['user_id']).all()
    result = []
    for booking in bookings:
        service = Services.query.get(booking.s_id)
        result.append({
            "id": booking.id,
            "status": booking.status,
            "date": booking.date_of_request.isoformat(),
            "service": {
                "id": service.id,
                "name": service.name,
                "image": service.image,
                "price": service.price
            }
        })

    if request.headers.get("Accept") == "application/json":
        return jsonify(result)

    return render_template("index.html")


@user_app.route('/bookings/<int:booking_id>', methods=['GET'])
def booking(booking_id):
    booking = Bookings.query.filter_by(id=booking_id, u_id=session['user_id']).first()
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    service = Services.query.filter_by(id=booking.s_id).first()
    rating = Rating.query.filter_by(b_id=booking_id).first()

    response_data = {
        'id': booking.id,
        'status': booking.status,
        'service': {
            'name': service.name,
            'description': service.description,
            'price': service.price,
            'image': service.image
        }
    }

    if booking.status == 'Closed' and rating:
        response_data['rating'] = {
            'stars': rating.rating,
            'comments': rating.comments
        }

    if request.headers.get("Accept") == "application/json":
        return jsonify(response_data)

    return render_template("index.html")


@user_app.route('/ratings/<int:booking_id>', methods=['POST'])
def create_rating(booking_id):
    try:
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        bookin_id = booking_id
        rating_value = data.get('rating')
        comments = data.get('comments', '')
        print(bookin_id)
        print(rating_value)
        if not all([bookin_id, rating_value]):
            return jsonify({'error': 'Missing required fields'}), 400
        print(1)
        booking = Bookings.query.filter_by(
            id=bookin_id,
            u_id=current_user_id,
            status='Completed'
        ).first()
        print(2)
        if not booking:
            return jsonify({'error': 'Invalid booking or not closed'}), 404
        print(3)
        existing_rating = Rating.query.filter_by(b_id=bookin_id).first()
        if existing_rating:
            return jsonify({'error': 'Rating already submitted'}), 400

        new_rating = Rating(
            b_id=bookin_id,
            e_id=booking.e_id,
            rating=rating_value,
            comments=comments
        )
        booking.status = 'Closed'
        db.session.add(new_rating)
        db.session.commit()

        response_data = {
            'message': 'Rating submitted successfully',
            'rating_id': new_rating.rating_id
        }

        if request.headers.get("Accept") == "application/json":
            return jsonify(response_data), 201

        return render_template("index.html")

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_app.route('/bookings/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    booking = Bookings.query.filter_by(id=booking_id, u_id=session.get('user_id')).first()
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if booking.status.lower() != 'pending':
        return jsonify({'error': 'Cannot delete an accepted booking'}), 400

    try:
        db.session.delete(booking)
        db.session.commit()

        response_data = {'message': 'Booking deleted successfully'}

        if request.headers.get("Accept") == "application/json":
            return jsonify(response_data), 200

        return render_template("index.html")

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@user_app.route('/user_search', methods=['GET'])
# @auth_required('token')
# @roles_required('user')
def user_search():
    query = request.args.get('q', '').lower()
    if not query:
        # If no query, return all services and bookings
        services_result = user_dashboard().get_json()
        my_services_result = get_user_services().get_json()
        return jsonify({"services": services_result, "my_services": my_services_result})

    try:
        # Search Available Services
        services = Services.query.filter(
            db.or_(
                Services.name.ilike(f'%{query}%'),
                Services.description.ilike(f'%{query}%')
            )
        ).all()
        services_list = [{"id": s.id, "name": s.name, "description": s.description, "price": s.price, "image": s.image}
                         for s in services]

        # Search My Services (Bookings)
        bookings = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(
                Bookings.u_id == session['user_id'],
                db.or_(
                    Services.name.ilike(f'%{query}%'),
                    Services.description.ilike(f'%{query}%')
                )
            ).all()
        my_services_list = []
        for booking in bookings:
            service = Services.query.get(booking.s_id)
            my_services_list.append({
                "id": booking.id,
                "status": booking.status,
                "date": booking.date_of_request.isoformat(),
                "service": {
                    "id": service.id,
                    "name": service.name,
                    "image": service.image,
                    "price": service.price
                }
            })

        return jsonify({
            "services": services_list,
            "my_services": my_services_list
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_app.route('/user_summary', methods=['GET'])
# @auth_required('token')
# @roles_required('user')
def user_summary():
    try:
        current_user = User.query.filter_by(id=session.get('user_id')).first()
        if not current_user:
            return jsonify({'error': 'Unauthorized'}), 401

        bookings = Bookings.query.filter_by(u_id=current_user.id).all()
        bookings_list = []
        total_spent = 0
        status_counts = {'Pending': 0, 'Completed': 0, 'Closed': 0}

        for booking in bookings:
            service = Services.query.get(booking.s_id)
            if service:  # Check if service exists
                total_spent += service.price
                status_counts[booking.status] = status_counts.get(booking.status, 0) + 1
                bookings_list.append({
                    "id": booking.id,
                    "status": booking.status,
                    "date": booking.date_of_request.isoformat(),
                    "service": {
                        "id": service.id,
                        "name": service.name,
                        "image": service.image,
                        "price": service.price
                    }
                })

        response_data = {
            "totalBookings": len(bookings_list),
            "totalSpent": total_spent,
            "statusCounts": status_counts,
            "bookings": bookings_list,
            "services": []  # Optional, can be populated if needed
        }

        if request.headers.get("Accept") == "application/json":
            return jsonify(response_data), 200

        return render_template("index.html")

    except Exception as e:
        return jsonify({'error': str(e)}), 500