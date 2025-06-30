# 🏠 Household Service Management System

The Household Service Management System is a web platform designed to streamline service booking and coordination between **Customers** and **Employees**, overseen by an **Admin**. It enables users to book household services like plumbing, cleaning, electrical repairs, and more.

---

## 👥 Roles

### Customer
- Register/Login
- Browse and book services
- Track bookings
- Leave feedback

### Employee
- Register/Login
- View assigned service requests
- Mark jobs as completed
- Manage service history

### Admin
- Monitor all users and service activity
- Approve/reject users
- Manage employees and customers

---

## 📁 Project Structure

Each module is structured into three Python files:

- **Views** – Manages routes and backend logic.
- **Models** – Defines the database tables and their relationships.

---

## 🛠 Tech Stack

### Client
- HTML5  
- CSS3  
- Bootstrap  
- JavaScript / Vue.js

### Server
- Flask  
- Flask-WTF  
- Flask-SQLAlchemy  
- Flask-Migrate  
- Flask-Security  
- Jinja2  
- Werkzeug

### Database
- SQLite

### Package Management
- pip  
- requirements.txt

### Development Tools
- PyCharm  
- SQLite Browser

---

## ✨ Features

- Role-based login for Customers, Employees, and Admins
- Secure form validation
- Employee assignment and task tracking
- Service request lifecycle management
- Admin control dashboard
- Responsive UI
- Optional Light/Dark mode

---
## Project is live [HERE](https://household-services-same.onrender.com/).
## 🚀 Run Locally

Clone the project in linux environment 

```bash
git clone https://github.com/yajath003/household-service-management-system.git
```
Go to the project directory

```bash
  cd HOUSEHOLD-SERVICES
```
Create virtual environment for the project

```bash
  python3 -m venv venv
```
Activate venv

```bash
source venv/bin/activate
```

Install dependencies

```bash
  pip install -r requirements.txt
```

Start the Server

```bash
  python3 main.py
```

## Screenshots
