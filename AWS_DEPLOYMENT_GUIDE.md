# EasyTravel - AWS Deployment Guide

This guide walks you through deploying the entire EasyTravel microservices architecture to **Amazon Web Services (AWS)** using **Docker** and **Docker Compose** on an **EC2 instance**.

---

## Architecture Overview in Docker

| Container Name | Service | Tech Stack | Internal/External Port |
| :--- | :--- | :--- | :--- |
| `easytravel-frontend` | React Frontend | Node / Nginx | `80` (HTTP) / `5173` |
| `easytravel-api-gateway`| API Gateway | Spring Cloud Gateway | `8080` |
| `easytravel-eureka` | Eureka Server | Spring Cloud Netflix | `8761` |
| `easytravel-auth-service` | Auth Microservice | Spring Boot | `8081` |
| `easytravel-booking-service`| Booking Microservice | Spring Boot | `8082` |
| `easytravel-admin-service` | Admin Microservice | Spring Boot | `8083` |
| `easytravel-notification-service` | Notifications (Gmail) | Spring Boot | `8084` |
| `easytravel-chatbot-service` | AI Chatbot | FastAPI / Python (Gemini) | `8085` |
| `easytravel-logging-service` | Logging Service | .NET 10 Web API | `8086` |
| `easytravel-mysql` | Database | MySQL 8.0 | `3306` (Internal) |
| `easytravel-redis` | Cache | Redis 7 | `6379` (Internal) |

---

## Step 1: Launch an AWS EC2 Instance

1. Go to the [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Click **Launch Instances**.
3. **Name**: `easytravel-server`
4. **AMI**: Ubuntu Server 24.04 LTS (or 22.04 LTS) (64-bit x86).
5. **Instance Type**: 
   - **Recommended**: `t3.large` (2 vCPU, 8 GB RAM) or `t3.medium` (4 GB RAM with Swap memory configured).
6. **Key Pair**: Select your existing key pair or create a new one (download `.pem` file).
7. **Storage**: Set root volume size to at least **25 GB - 30 GB** (to hold Docker images, Java builds, and MySQL data).

---

## Step 2: Configure Security Group Rules

In your EC2 Security Group **Inbound Rules**, open the following ports:

| Type | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | `My IP` or `0.0.0.0/0` | Secure Shell terminal access |
| **HTTP** | `80` | `0.0.0.0/0` | Web application (Frontend) |
| **Custom TCP** | `8080` | `0.0.0.0/0` | API Gateway REST API |
| **Custom TCP** | `8761` | `My IP` (Recommended) | Eureka Server Dashboard |
| **Custom TCP** | `5173` | `0.0.0.0/0` | Vite Alternative Port |

---

## Step 3: Connect to your EC2 Instance

Open PowerShell or Terminal and SSH into your server:
```bash
ssh -i "your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## Step 4: Install Docker & Docker Compose on Ubuntu

Run the following commands on your EC2 instance:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3. Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine and Docker Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Enable Docker permissions for ubuntu user
sudo usermod -aG docker ubuntu
newgrp docker

# 7. Verify Docker installation
docker --version
docker compose version
```

---

## Step 5: (Optional for `t3.medium`) Configure 4GB Swap Space

If using a smaller EC2 instance (4GB RAM), create a swap file to ensure smooth compilation:
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Step 6: Deploy EasyTravel Code to AWS

### Option A: Clone from GitHub (Recommended)
```bash
git clone <YOUR_GIT_REPO_URL>
cd Project_CLEAN
```

### Option B: Copy Files from Local PC via SCP
```bash
# Run this from your local Windows terminal inside Project_CLEAN:
scp -i "your-key.pem" -r . ubuntu@<YOUR_EC2_PUBLIC_IP>:~/Project_CLEAN/
```

---

## Step 7: Configure Production `.env` File

Create a `.env` file on your EC2 server inside the `Project_CLEAN` root directory:

```bash
nano .env
```

Paste and adjust your credentials:
```ini
# --- Database ---
DB_USERNAME=root
DB_PASSWORD=your_strong_mysql_password

# --- Security ---
JWT_SECRET=BusBookingSystem_SecretKey_2024_CDAC_Project_MustBe32CharsMin!

# --- Gmail SMTP Notification ---
GMAIL_USERNAME=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password

# --- Python Chatbot Service ---
GEMINI_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
API_GATEWAY_URL=http://api-gateway:8080/api
```

Save with `Ctrl + O`, `Enter`, and exit with `Ctrl + X`.

---

## Step 8: Build and Run with Docker Compose

Start the entire application stack in detached mode:

```bash
# Build and launch all 11 containers
docker compose up -d --build
```

### Verify Container Status
```bash
docker compose ps
```

All containers should show `Up` or `running` state.

---

## Step 9: Access Your Application

Replace `<YOUR_EC2_PUBLIC_IP>` with your actual AWS instance public IP:

- **Frontend App**: `http://<YOUR_EC2_PUBLIC_IP>`
- **API Gateway**: `http://<YOUR_EC2_PUBLIC_IP>:8080`
- **Eureka Dashboard**: `http://<YOUR_EC2_PUBLIC_IP>:8761`

---

## Useful Docker Maintenance Commands

| Task | Command |
| :--- | :--- |
| **View logs for all services** | `docker compose logs -f` |
| **View logs for a specific service** | `docker compose logs -f auth-service` |
| **Restart a single service** | `docker compose restart api-gateway` |
| **Rebuild and restart a single service** | `docker compose up -d --build booking-service` |
| **Stop the whole stack** | `docker compose down` |
| **Stop and remove all volumes (clean reset)** | `docker compose down -v` |
