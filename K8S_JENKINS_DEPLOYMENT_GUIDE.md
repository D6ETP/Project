# EasyTravel - Kubernetes & Jenkins CI/CD Deployment Guide

This guide details how to automate the build, test, containerization, and deployment of the **EasyTravel** microservices platform using **Jenkins CI/CD** and **Kubernetes (K8s)**.

---

## 🏗️ Architecture & Component Mapping

| Service | Technology | Internal Port | K8s Manifest |
| :--- | :--- | :--- | :--- |
| **Frontend** | React / Vite / Nginx | `80` | `k8s/05-frontend.yaml` |
| **API Gateway** | Spring Cloud Gateway | `8080` | `k8s/03-discovery-gateway.yaml` |
| **Eureka Server** | Spring Cloud Netflix Eureka | `8761` | `k8s/03-discovery-gateway.yaml` |
| **Auth Service** | Spring Boot / JPA | `8081` | `k8s/04-backend-services.yaml` |
| **Booking Service** | Spring Boot / Redis / MySQL | `8082` | `k8s/04-backend-services.yaml` |
| **Admin Service** | Spring Boot / JPA | `8083` | `k8s/04-backend-services.yaml` |
| **Notification Service** | Spring Boot / JavaMail (SMTP) | `8084` | `k8s/04-backend-services.yaml` |
| **AI Chatbot Service** | Python FastAPI / Gemini API | `8085` | `k8s/04-backend-services.yaml` |
| **Logging Service** | .NET 10 Web API | `8086` | `k8s/04-backend-services.yaml` |
| **MySQL Database** | MySQL 8.0 (Stateful) | `3306` | `k8s/02-storage-and-databases.yaml` |
| **Redis Cache** | Redis 7 Alpine | `6379` | `k8s/02-storage-and-databases.yaml` |
| **Ingress** | NGINX Ingress Controller | `80` / `443` | `k8s/06-ingress.yaml` |

---

## 📋 Prerequisites

1. **Kubernetes Cluster**:
   - Any running cluster: **Minikube**, **Kind**, **AWS EKS**, **Azure AKS**, **Google GKE**, or self-hosted **K3s/K8s**.
2. **Jenkins Server**:
   - Jenkins installed with Docker and `kubectl` accessible by the `jenkins` user.
3. **Container Registry**:
   - Docker Hub account (or AWS ECR, GitHub Packages, Harbor).
4. **Tools on Jenkins Runner / Node**:
   - `docker` (and permission: `sudo usermod -aG docker jenkins`)
   - `kubectl` configured with cluster access
   - `git`, `maven`, `nodejs` (or executed via multi-stage Docker builds)

---

## ⚙️ Step 1: Configure Jenkins

### 1. Install Recommended Jenkins Plugins
Go to **Manage Jenkins** $\rightarrow$ **Plugins** $\rightarrow$ **Available plugins** and install:
- **Pipeline**
- **Docker Pipeline** / **Docker**
- **Kubernetes CLI**
- **Credentials Binding Plugin**
- **AnsiColor**
- **Git**

### 2. Configure Credentials in Jenkins
Go to **Manage Jenkins** $\rightarrow$ **Credentials** $\rightarrow$ **System** $\rightarrow$ **Global credentials** $\rightarrow$ **Add Credentials**:

#### A. Docker Registry Credentials:
- **Kind**: `Username with password`
- **Scope**: `Global`
- **Username**: `<your-dockerhub-username>`
- **Password**: `<your-dockerhub-token-or-password>`
- **ID**: `dockerhub-creds` *(Matches the parameter in `Jenkinsfile`)*

#### B. Kubernetes Kubeconfig:
- **Kind**: `Secret file`
- **Scope**: `Global`
- **File**: Upload your cluster's `kubeconfig` file (usually found at `~/.kube/config`).
- **ID**: `k8s-kubeconfig` *(Matches the parameter in `Jenkinsfile`)*

---

## 🚀 Step 2: Create and Run the Jenkins Pipeline Job

1. On Jenkins Dashboard, click **New Item**.
2. Enter name (e.g. `easytravel-cicd`) and select **Pipeline**, then click **OK**.
3. In the Pipeline configuration:
   - Check **This project is parameterized** (parameters from the `Jenkinsfile` will auto-populate on first run).
   - Under **Pipeline**, set **Definition** to `Pipeline script from SCM`.
   - **SCM**: `Git`
   - **Repository URL**: `<YOUR_GIT_REPOSITORY_URL>` (e.g. `https://github.com/username/easytravel.git`)
   - **Credentials**: Add your Git personal access token or SSH key if the repository is private.
   - **Branch Specifier**: `*/main` (or `*/master`)
   - **Script Path**: `Jenkinsfile`
4. Click **Save**.
5. Click **Build with Parameters**:
   - `DOCKER_REGISTRY`: Enter `docker.io/<your-dockerhub-username>` (e.g. `docker.io/johndoe`)
   - `IMAGE_TAG`: e.g. `build-1` or `v1.0.0`
   - `DEPLOY_TO_K8S`: `true`
   - `K8S_NAMESPACE`: `easytravel`
   - `DOCKER_CREDENTIALS_ID`: `dockerhub-creds`
   - `KUBECONFIG_CREDENTIALS_ID`: `k8s-kubeconfig`
6. Click **Build**.

---

## 🛠️ Step 3: Manual Direct Deployment (Quickstart without Jenkins)

If you wish to deploy the manifests directly using `kubectl`:

### 1. Update Secrets
Edit [`k8s/01-secrets-and-configmap.yaml`](file:///e:/Project%20Test/Project/k8s/01-secrets-and-configmap.yaml) and replace placeholder secrets with your real values:
- `JWT_SECRET`
- `GMAIL_USERNAME` and `GMAIL_APP_PASSWORD`
- `GEMINI_API_KEY` and `OPENWEATHER_API_KEY`
- `MYSQL_ROOT_PASSWORD` / `DB_PASSWORD`

### 2. Apply Manifests
Run the following commands in order:

```bash
# 1. Create the easytravel namespace
kubectl apply -f k8s/00-namespace.yaml

# 2. Apply ConfigMaps and Secrets
kubectl apply -f k8s/01-secrets-and-configmap.yaml

# 3. Deploy Databases (MySQL & Redis with persistent volumes)
kubectl apply -f k8s/02-storage-and-databases.yaml

# 4. Deploy Discovery & Gateway
kubectl apply -f k8s/03-discovery-gateway.yaml

# 5. Deploy Backend Microservices (.NET, Spring Boot, Python FastAPI)
kubectl apply -f k8s/04-backend-services.yaml

# 6. Deploy React Frontend
kubectl apply -f k8s/05-frontend.yaml

# 7. Apply Ingress / NodePort routing
kubectl apply -f k8s/06-ingress.yaml
```

---

## 🔍 Step 4: Verification & Accessing Services

### 1. Check Pod Statuses
```bash
kubectl get pods -n easytravel -o wide
```

Expected output:
```text
NAME                                    READY   STATUS    RESTARTS   AGE
admin-service-58968499bf-xxxxx          1/1     Running   0          2m
api-gateway-695c879d7d-xxxxx            1/1     Running   0          2m
auth-service-795b546db9-xxxxx           1/1     Running   0          2m
booking-service-74bfbb7f7f-xxxxx        1/1     Running   0          2m
chatbot-service-76b9f47bc5-xxxxx        1/1     Running   0          2m
eureka-server-67cb5666fc-xxxxx          1/1     Running   0          3m
frontend-6b8f9b96df-xxxxx               1/1     Running   0          2m
logging-service-5dbdfc8d5c-xxxxx        1/1     Running   0          2m
mysql-78f9f8c6b7-xxxxx                  1/1     Running   0          3m
notification-service-5d66679586-xxxxx   1/1     Running   0          2m
redis-549b4f65c9-xxxxx                  1/1     Running   0          3m
```

### 2. Port Forwarding for Local Testing
To test the application on your machine without an Ingress controller:

```bash
# Access React Frontend on http://localhost:3000
kubectl port-forward svc/frontend 3000:80 -n easytravel

# Access API Gateway on http://localhost:8080
kubectl port-forward svc/api-gateway 8080:8080 -n easytravel

# Access Eureka Dashboard on http://localhost:8761
kubectl port-forward svc/eureka-server 8761:8761 -n easytravel

# Access AI Chatbot API on http://localhost:8085
kubectl port-forward svc/chatbot-service 8085:8085 -n easytravel
```

### 3. Access via NodePort
If deployed on cloud VMs without Ingress:
- **Frontend**: `http://<NODE_PUBLIC_IP>:30080`
- **API Gateway**: `http://<NODE_PUBLIC_IP>:30088`

---

## 🌐 Step 5: NGINX Ingress Controller Setup (Production)

To route all traffic through standard domain names or port 80/443:

1. **Install NGINX Ingress Controller**:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml
   ```
2. Once the ingress load balancer IP is provisioned:
   ```bash
   kubectl get ingress -n easytravel
   ```
3. Map your domain DNS `A record` to the Ingress external IP.

---

## 🩺 Useful Debugging & Maintenance Commands

| Action | Command |
| :--- | :--- |
| **View logs for a service** | `kubectl logs -f deployment/api-gateway -n easytravel` |
| **Check container crashes/events** | `kubectl describe pod <pod-name> -n easytravel` |
| **Execute into a pod** | `kubectl exec -it <pod-name> -n easytravel -- /bin/sh` |
| **Check MySQL logs** | `kubectl logs -f deployment/mysql -n easytravel` |
| **Restart all deployments** | `kubectl rollout restart deployment -n easytravel` |
| **Scale a microservice** | `kubectl scale deployment booking-service --replicas=3 -n easytravel` |
| **Delete all resources** | `kubectl delete namespace easytravel` |
