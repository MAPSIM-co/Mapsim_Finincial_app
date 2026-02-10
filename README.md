
# Mapsim Financial App 🚀

A production-ready full-stack financial planning application powered by **FastAPI** and a modern frontend.
Designed for **Linux VPS deployment (Ubuntu)** with a clean architecture, database support, and scalability in mind.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Local Development](#local-development)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Running on Ubuntu VPS (Port 8002)](#running-on-ubuntu-vps-port-8002)
- [Run as a systemd Service](#run-as-a-systemd-service)
- [Firewall Configuration](#firewall-configuration)
- [Production Deployment Notes](#production-deployment-notes)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [License](#license)

---

## 🔎 Overview

**Mapsim Financial App** is a financial analysis and planning platform consisting of:

- A **FastAPI backend** exposing a RESTful API
- A **separate frontend** consuming backend APIs
- A **relational database** for persistent storage

The application is suitable for personal, enterprise, and SaaS-style deployments.

---

## 📁 Project Structure

```
Mapsim_Finincial_app/
├── my_financial_plan_backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   └── database.py
│   └── .env
│
├── my_financial_plan_frontend/
│   ├── package.json
│   ├── src/
│   └── public/
│
├── LICENSE
└── README.md
```

---

## ✨ Features

- FastAPI backend with high performance
- Automatic Swagger & ReDoc API documentation
- Modular backend structure
- Relational database support (MySQL / PostgreSQL)
- Frontend-backend separation
- VPS & production ready
- systemd service support

---

## 🧰 Tech Stack

### Backend
- Python 3.9+
- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic (optional)

### Frontend
- Node.js
- npm / yarn
- Modern JS framework (React / Vue)

### Database
- MySQL / MariaDB
- PostgreSQL

### Infrastructure
- Ubuntu Linux
- systemd
- Nginx (recommended)

---

## 🖥️ System Requirements

- Ubuntu 20.04 / 22.04
- Python 3.9 or newer
- Node.js 18+
- Git
- Internet access

---

## 💻 Local Development

Clone the repository:

```bash
git clone https://github.com/MAPSIM-co/Mapsim_Finincial_app.git
cd Mapsim_Finincial_app
```

---

## ⚙️ Backend Setup

```bash
cd my_financial_plan_backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

Backend URL:
```
http://127.0.0.1:8002
```

---

## 🎨 Frontend Setup

```bash
cd my_financial_plan_frontend

npm install
npm start
```

Frontend URL:
```
http://localhost:3000
```

---

## 🗄️ Database Setup

### Supported Databases
- MySQL / MariaDB (recommended)
- PostgreSQL

---

### 🐬 MySQL Installation (Ubuntu)

```bash
sudo apt update
sudo apt install mysql-server -y
sudo systemctl enable mysql
sudo systemctl start mysql
```

Secure installation:

```bash
sudo mysql_secure_installation
```

---

### 🧱 Create Database & User

```bash
sudo mysql
```

```sql
CREATE DATABASE mapsim_financial_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER 'mapsim_user'@'localhost'
IDENTIFIED BY 'STRONG_PASSWORD';

GRANT ALL PRIVILEGES ON mapsim_financial_db.* TO 'mapsim_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 🔐 Environment Variables

Create `.env` file:

```bash
cd my_financial_plan_backend
nano .env
```

```env
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=mapsim_financial_db
DB_USER=mapsim_user
DB_PASSWORD=STRONG_PASSWORD
```

Add `.env` to `.gitignore`:
```
.env
```

---

### 🔗 Database Connection Example

```python
DATABASE_URL = "mysql+pymysql://mapsim_user:STRONG_PASSWORD@127.0.0.1:3306/mapsim_financial_db"
```

---

### 📦 Install Database Drivers

```bash
pip install sqlalchemy pymysql
```

---

### 🧬 Create Tables

```python
from database import Base, engine
Base.metadata.create_all(bind=engine)
```

Run once:

```bash
python init_db.py
```

---

## 🖥️ Running on Ubuntu VPS (Port 8002)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv git -y

cd /opt
git clone https://github.com/MAPSIM-co/Mapsim_Finincial_app.git
cd Mapsim_Finincial_app/my_financial_plan_backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8002
```

---

## 🔁 Run as a systemd Service

```bash
sudo nano /etc/systemd/system/mapsim-backend.service
```

```ini
[Unit]
Description=Mapsim Financial Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/Mapsim_Finincial_app/my_financial_plan_backend
ExecStart=/opt/Mapsim_Finincial_app/my_financial_plan_backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8002
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable mapsim-backend
sudo systemctl start mapsim-backend
```

---

## 🔐 Firewall Configuration

```bash
sudo ufw allow 8002
sudo ufw reload
```

---

## 🚀 Production Deployment Notes

- Use Nginx as reverse proxy
- Enable HTTPS (Let's Encrypt)
- Use Gunicorn + Uvicorn workers
- Use environment variables for secrets
- Regular database backups

---

## 📚 API Documentation

- Swagger UI:
```
http://SERVER_IP:8002/docs
```

- ReDoc:
```
http://SERVER_IP:8002/redoc
```

---

## 🛠️ Troubleshooting

**Port already in use**
```bash
sudo lsof -i :8002
```

**Check logs**
```bash
journalctl -u mapsim-backend -n 50
```

---

## 🔒 Security Notes

- Never commit `.env` files
- Use strong DB passwords
- Restrict database access to localhost
- Enable firewall

---

## 📄 License

This project is licensed under the terms of the LICENSE file.

---

### Maintained by MAPSIM