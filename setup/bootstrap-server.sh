#!/usr/bin/env bash
# ==============================================================================
#  EasyTravel — 1-Click Cloud Server Bootstrap Script (100% Free Tier Compatible)
#  Target OS: Ubuntu 22.04 LTS / 24.04 LTS (AWS EC2 / DigitalOcean / Linode)
# ==============================================================================

set -e

echo "=========================================================="
echo " 🚀 EasyTravel — Initializing Cloud Kubernetes & Jenkins   "
echo "=========================================================="

# 1. Update system packages
echo "📦 Step 1: Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git jq apt-transport-https ca-certificates gnupg lsb-release

# 2. Setup 4GB Swap Space (Essential for Free Tier 1GB/2GB RAM VMs)
echo "💾 Step 2: Configuring 4GB Swap Space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "✅ Swap configured successfully."
else
    echo "ℹ️ Swap already exists."
fi

# 3. Install Docker Engine
echo "🐳 Step 3: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
    rm -f get-docker.sh
    echo "✅ Docker installed successfully."
else
    echo "ℹ️ Docker is already installed."
fi

# 4. Install k3s (Lightweight CNCF Kubernetes)
echo "☸️ Step 4: Installing k3s Kubernetes..."
if ! command -v k3s &> /dev/null; then
    curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644" sh -
    
    # Configure kubectl access for current user
    mkdir -p ~/.kube
    sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
    sudo chown $(id -u):$(id -g) ~/.kube/config
    export KUBECONFIG=~/.kube/config
    echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc
    
    echo "✅ k3s installed and kubectl configured."
else
    echo "ℹ️ k3s is already installed."
fi

# Wait for k3s node to be Ready
echo "⏳ Waiting for Kubernetes node to be ready..."
kubectl wait --for=condition=Ready node --all --timeout=60s

echo "=========================================================="
echo " 🎉 Cloud Server is Ready! Next steps:                     "
echo " 1. Deploy Jenkins:                                       "
echo "    kubectl apply -f k8s/07-jenkins.yaml                  "
echo "                                                          "
echo " 2. Get Jenkins initial Admin Password:                   "
echo "    kubectl logs -n jenkins deployment/jenkins            "
echo "                                                          "
echo " 3. Access URLs (replace <YOUR_PUBLIC_IP> with EC2 IP):    "
echo "    - Frontend:  http://<YOUR_PUBLIC_IP>:30080            "
echo "    - Gateway:   http://<YOUR_PUBLIC_IP>:30088            "
echo "    - Jenkins:   http://<YOUR_PUBLIC_IP>:32000            "
echo "=========================================================="
