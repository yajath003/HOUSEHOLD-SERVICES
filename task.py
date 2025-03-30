import csv
import os
from api.models import db
from user.models import Bookings
from admin.models import Services
from employee.models import Employee
from datetime import datetime
# import requests
from celery import shared_task

# Google Chat Webhook URL (replace with your actual webhook URL)
GOOGLE_CHAT_WEBHOOK_URL = 'https://chat.googleapis.com/v1/spaces/XXXX/messages?key=YYYY&token=ZZZZ'

@shared_task(ignore_result=False, name="task.download_csv_report")
def csv_report(employee_id):
    try:
        os.makedirs('static/downloads', exist_ok=True)
        bookings = Bookings.query \
            .join(Services, Bookings.s_id == Services.id) \
            .filter(
                Bookings.e_id == employee_id,
                Bookings.status == 'Closed'
            ).all()

        if not bookings:
            return {"error": "No closed service requests found for this employee"}

        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"closed_services_employee_{employee_id}_{timestamp}.csv"
        filepath = os.path.join('static/downloads', filename)

        headers = ['Service ID', 'Service Name', 'Customer ID', 'Professional ID', 'Date of Request', 'Date of Completion', 'Remarks']
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(headers)
            for booking in bookings:
                service = Services.query.get(booking.s_id)
                writer.writerow([
                    booking.s_id,
                    service.name if service else 'Unknown',
                    booking.u_id,
                    booking.e_id,
                    booking.date_of_request.isoformat(),
                    booking.date_of_completion.isoformat() if booking.date_of_completion else 'N/A',
                    'Closed'
                ])

        return {"file_url": f"/static/downloads/{filename}"}
    except Exception as e:
        return {"error": f"Task failed: {str(e)}"}

@shared_task(name='task.send_reminders')
def send_reminders():
    try:
        employees = Employee.query.all()
        
        for employee in employees:
            pending_requests = Bookings.query \
                .filter_by(e_id=employee.employee_id, status='Pending') \
                .all()

            if pending_requests:
                message = f"Hi {employee.name},\nYou have {len(pending_requests)} pending service request(s) to review.\nPlease accept or reject them:\n"
                for req in pending_requests:
                    service = Services.query.get(req.s_id)
                    message += f"- Service: {service.name} (Request ID: {req.id}, Date: {req.date_of_request.strftime('%Y-%m-%d')})\n"
                message += "Visit the dashboard to take action."

                payload = {
                    'text': message
                }
                response = requests.post(GOOGLE_CHAT_WEBHOOK_URL, json=payload)
                
                if response.status_code != 200:
                    print(f"Failed to send reminder to {employee.name}: {response.text}")
                else:
                    print(f"Reminder sent to {employee.name} successfully")
                    
        return {"status": "Reminders sent successfully"}
    except Exception as e:
        print(f"Error in send_reminders: {str(e)}")
        return {"error": str(e)}