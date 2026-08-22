#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# EasyTravel — Full Deploy Script
# ═══════════════════════════════════════════════════════════════════════════════
# Run this script on your VM after:
#   1. Every git push / code change
#   2. Every VM restart
#
# Usage:
#   chmod +x deploy.sh     (first time only)
#   ./deploy.sh            (deploy everything)
#   ./deploy.sh frontend   (deploy only frontend)
#   ./deploy.sh gateway    (deploy only api-gateway)
#   ./deploy.sh <service>  (deploy a specific service)
# ═══════════════════════════════════════════════════════════════════════════════

set -e

EXTERNAL_IP="34.47.183.198"
NAMESPACE="easytravel"
PROJECT_DIR="$HOME/Project"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✔]${NC} $1"; }
info() { echo -e "${CYAN}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✘]${NC} $1"; }

# ─── Step 0: Navigate to project ──────────────────────────────────────────────
cd "$PROJECT_DIR"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   🚌 EasyTravel Deployment Script${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# ─── Step 1: Pull latest code from GitHub ─────────────────────────────────────
info "Pulling latest code from GitHub..."
git pull origin main || warn "Git pull failed — continuing with local code"
log "Code is up to date"

# ─── Step 2: Apply all Kubernetes manifests ───────────────────────────────────
info "Applying Kubernetes manifests..."
sudo kubectl apply -f k8s/
log "Kubernetes manifests applied"

# ─── Helper: Build, Import, and Restart a service ─────────────────────────────
build_and_deploy() {
    local SERVICE_NAME=$1
    local DOCKER_PATH=$2
    local IMAGE_NAME=$3
    local EXTRA_ARGS=${4:-""}

    info "Building ${SERVICE_NAME}..."
    docker build --no-cache $EXTRA_ARGS -t "$IMAGE_NAME" "$DOCKER_PATH"
    log "${SERVICE_NAME} image built"

    info "Importing ${SERVICE_NAME} into k3s..."
    docker save "$IMAGE_NAME" | sudo k3s ctr images import -
    log "${SERVICE_NAME} imported into k3s"

    info "Restarting ${SERVICE_NAME} pod..."
    sudo kubectl delete pod -n "$NAMESPACE" -l "app=${SERVICE_NAME}" --ignore-not-found=true 2>/dev/null || true
    log "${SERVICE_NAME} pod restarted"
}

# ─── Determine what to deploy ─────────────────────────────────────────────────
TARGET=${1:-"all"}

case "$TARGET" in
    all)
        echo ""
        info "🔨 Building ALL services..."
        echo ""

        # Infrastructure services (no rebuild needed — use official images)
        # MySQL (mysql:8.0), Redis (redis:7-alpine) — already pulled

        # Backend Java services
        build_and_deploy "eureka-server" "./Backend/eureka-server" "easytravel/eureka-server:latest"
        build_and_deploy "api-gateway" "./Backend/api-gateway" "easytravel/api-gateway:latest"
        build_and_deploy "auth-service" "./Backend/auth-service" "easytravel/auth-service:latest"
        build_and_deploy "booking-service" "./Backend/booking-service" "easytravel/booking-service:latest"
        build_and_deploy "admin-service" "./Backend/admin-service" "easytravel/admin-service:latest"
        build_and_deploy "notification-service" "./Backend/notification-service" "easytravel/notification-service:latest"

        # .NET Logging Service
        build_and_deploy "logging-service" "./Backend/LoggingService" "easytravel/logging-service:latest"

        # Python Chatbot Service
        build_and_deploy "chatbot-service" "./Backend/chatbot-service" "easytravel/chatbot-service:latest"

        # Frontend (React + Nginx) — uses /api relative path (proxied by nginx), no external IP needed
        build_and_deploy "frontend" "./frontend" "easytravel/frontend:latest"
        ;;

    frontend)
        build_and_deploy "frontend" "./frontend" "easytravel/frontend:latest"
        ;;

    gateway|api-gateway)
        build_and_deploy "api-gateway" "./Backend/api-gateway" "easytravel/api-gateway:latest"
        ;;

    auth|auth-service)
        build_and_deploy "auth-service" "./Backend/auth-service" "easytravel/auth-service:latest"
        ;;

    booking|booking-service)
        build_and_deploy "booking-service" "./Backend/booking-service" "easytravel/booking-service:latest"
        ;;

    admin|admin-service)
        build_and_deploy "admin-service" "./Backend/admin-service" "easytravel/admin-service:latest"
        ;;

    notification|notification-service)
        build_and_deploy "notification-service" "./Backend/notification-service" "easytravel/notification-service:latest"
        ;;

    logging|logging-service)
        build_and_deploy "logging-service" "./Backend/LoggingService" "easytravel/logging-service:latest"
        ;;

    chatbot|chatbot-service)
        build_and_deploy "chatbot-service" "./Backend/chatbot-service" "easytravel/chatbot-service:latest"
        ;;

    eureka|eureka-server)
        build_and_deploy "eureka-server" "./Backend/eureka-server" "easytravel/eureka-server:latest"
        ;;

    k8s|manifests)
        info "Only applying Kubernetes manifests (no image rebuild)..."
        log "Done — manifests applied above"
        ;;

    *)
        err "Unknown service: $TARGET"
        echo ""
        echo "Usage: ./deploy.sh [service]"
        echo ""
        echo "Services:"
        echo "  all            Deploy everything (default)"
        echo "  frontend       React frontend only"
        echo "  gateway        API Gateway only"
        echo "  auth           Auth Service only"
        echo "  booking        Booking Service only"
        echo "  admin          Admin Service only"
        echo "  notification   Notification Service only"
        echo "  logging        .NET Logging Service only"
        echo "  chatbot        AI Chatbot Service only"
        echo "  eureka         Eureka Discovery Server only"
        echo "  k8s            Apply K8s manifests only (no rebuild)"
        exit 1
        ;;
esac

# ─── Step 3: Wait for all pods to be Ready ────────────────────────────────────
echo ""
info "Waiting for pods to stabilize..."
sleep 5

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   📊 Pod Status${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
sudo kubectl get pods -n "$NAMESPACE"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "   🌐 Frontend:    ${CYAN}http://${EXTERNAL_IP}:30080${NC}"
echo -e "   🔌 API Gateway: ${CYAN}http://${EXTERNAL_IP}:30088${NC}"
echo -e "   📡 Eureka:      ${CYAN}http://${EXTERNAL_IP}:8761 (port-forward needed)${NC}"
echo ""
