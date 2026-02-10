# Mapsim Financial App 🚀

A full-stack financial planning application consisting of a **FastAPI backend** and a **modern frontend**.
This project is designed to be deployed on a Linux VPS (Ubuntu) and is suitable for production environments.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Local Development Setup](#local-development-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running on Ubuntu VPS (Port 8002)](#running-on-ubuntu-vps-port-8002)
- [Running as a System Service (systemd)](#running-as-a-system-service-systemd)
- [Firewall Configuration](#firewall-configuration)
- [Production Recommendations](#production-recommendations)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🔎 Overview

**Mapsim Financial App** is a financial planning and analysis platform that allows users to manage, analyze,
and visualize financial data through a RESTful API and a user-friendly frontend.

The backend is built with **FastAPI**, providing high performance and automatic API documentation.
The frontend consumes the API and presents interactive financial views.

---

## 📁 Project Structure

```
Mapsim_Finincial_app/
├── my_financial_plan_backend/
│   ├── main.py                # FastAPI entry point
│   ├── requirements.txt       # Python dependencies
│   ├── app/                   # Application modules
│   └── ...
│
├── my_financial_plan_frontend/
│   ├── package.json           # Frontend dependencies
│   ├── src/                   # Frontend source code
│   └── ...
│
├── LICENSE
└── README.md
```

---

## ✨ Features

- RESTful API with FastAPI
- Automatic Swagger & ReDoc documentation
- Modular backend architecture
- Frontend separated from backend
- Easy deployment on VPS
- Ready for production scaling

---

## 🧰 Tech Stack

### Backend
- Python 3.9+
- FastAPI
- Uvicorn
- Pydantic

### Frontend
- Node.js
- npm / yarn
- Modern JS framework (React/Vue)

### Infrastructure
- Ubuntu Linux
- Nginx (optional, recommended)
- systemd (for service management)

---

## 📦 Requirements

Before installation, make sure you have:

- Ubuntu 20.04 / 22.04
- Python 3.9 or higher
- pip & venv
- Node.js 18+
- npm or yarn
- Git

---

## 💻 Local Development Setup

### Backend Setup

```bash
# Clone repository
git clone https://github.com/MAPSIM-co/Mapsim_Finincial_app.git
cd Mapsim_Finincial_app/my_financial_plan_backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

Backend will be available at:
```
http://127.0.0.1:8002
```

---

### Frontend Setup

```bash
cd Mapsim_Finincial_app/my_financial_plan_frontend

# Install dependencies
npm install

# Run frontend
npm start
```

Frontend usually runs on:
```
http://localhost:3000
```

---

## 🖥️ Running on Ubuntu VPS (Port 8002)

### 1️⃣ Update Server

```bash
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Install Required Packages

```bash
sudo apt install python3 python3-pip python3-venv git -y
```

### 3️⃣ Clone Project

```bash
cd /opt
sudo git clone https://github.com/MAPSIM-co/Mapsim_Finincial_app.git
sudo chown -R $USER:$USER Mapsim_Finincial_app
```

### 4️⃣ Backend Installation

```bash
cd /opt/Mapsim_Finincial_app/my_financial_plan_backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 5️⃣ Run Backend

```bash
uvicorn main:app --host 0.0.0.0 --port 8002
```

Access API:
```
http://SERVER_IP:8002
```

---

## ⚙️ Running as a System Service (systemd)

Create service file:

```bash
sudo nano /etc/systemd/system/mapsim-backend.service
```

Paste the following:

```ini
[Unit]
Description=Mapsim Financial FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/Mapsim_Finincial_app/my_financial_plan_backend
ExecStart=/opt/Mapsim_Finincial_app/my_financial_plan_backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8002
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable mapsim-backend
sudo systemctl start mapsim-backend
sudo systemctl status mapsim-backend
```

---

## 🔐 Firewall Configuration

If UFW is enabled:

```bash
sudo ufw allow 8002
sudo ufw reload
```

---

## 🚀 Production Recommendations

- Use **Nginx** as a reverse proxy
- Use **Gunicorn + Uvicorn workers**
- Enable HTTPS with **Let's Encrypt**
- Store secrets in environment variables
- Enable logging and monitoring

Example Gunicorn command:

```bash
gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8002 --workers 4
```

---

## 📚 API Documentation

Once running, access:

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

**Permission issues**
```bash
sudo chown -R $USER:$USER /opt/Mapsim_Finincial_app
```

**Service not starting**
```bash
journalctl -u mapsim-backend -n 50
```

---

## 📄 License

This project is licensed under the terms of the LICENSE file.

---

### ✨ Maintained by MAPSIM
