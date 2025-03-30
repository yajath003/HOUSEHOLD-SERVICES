# main.py
from flask_restful import Api
from flask_cors import CORS
from application import create_app
from api.views import api_app
from admin.views import admin_app
from employee.views import employee_app
from user.views import user_app
from api.celery_init import celery_init_app
from celery.schedules import crontab

# Create the Flask app
app = create_app()

# Initialize Celery
celery_app = celery_init_app(app)  # Rename variable to celery_app
from task import send_reminders, csv_report
# Configure Celery Beat schedule
celery_app.conf.beat_schedule = {
    'send-daily-reminders': {
        'task': 'task.send_reminders',  # Changed from 'tasks' to 'task'
        'schedule': crontab(hour=18, minute=0),
    },
}

# Initialize Flask-Restful and Flask-CORS
api = Api(app)
CORS(app)

# Register blueprints
app.register_blueprint(api_app)
app.register_blueprint(admin_app)
app.register_blueprint(employee_app)
app.register_blueprint(user_app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, use_reloader=True, debug=True)