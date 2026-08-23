pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    triggers {
        // Poll GitHub every 2 minutes for new commits and auto-trigger build
        pollSCM('H/2 * * * *')
    }

    parameters {
        string(name: 'DOCKER_REGISTRY', defaultValue: 'docker.io/abhirk12', description: 'Docker Registry URL or DockerHub namespace (e.g. docker.io/abhirk12)')
        string(name: 'IMAGE_TAG', defaultValue: 'build-${BUILD_NUMBER}', description: 'Tag for built container images')
        booleanParam(name: 'DEPLOY_TO_K8S', defaultValue: true, description: 'Whether to deploy to Kubernetes cluster upon successful build')
        string(name: 'K8S_NAMESPACE', defaultValue: 'easytravel', description: 'Kubernetes target namespace')
        string(name: 'DOCKER_CREDENTIALS_ID', defaultValue: 'dockerhub-creds', description: 'Jenkins Credentials ID for Docker Registry login')
        string(name: 'KUBECONFIG_CREDENTIALS_ID', defaultValue: 'k8s-kubeconfig', description: 'Jenkins Secret File Credentials ID for kubeconfig')
    }

    environment {
        REGISTRY = "${params.DOCKER_REGISTRY}"
        TAG = "${params.IMAGE_TAG}"
        NAMESPACE = "${params.K8S_NAMESPACE}"
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo "Pulling source code from Git repository..."
                checkout scm
            }
        }

        stage('Build Microservices Docker Images') {
            steps {
                script {
                    echo "Building Docker images using Multi-Stage Dockerfiles..."
                    def microservices = [
                        [name: 'easytravel-eureka', dir: 'Backend/eureka-server', tag: 'easytravel/eureka-server:latest'],
                        [name: 'easytravel-auth-service', dir: 'Backend/auth-service', tag: 'easytravel/auth-service:latest'],
                        [name: 'easytravel-booking-service', dir: 'Backend/booking-service', tag: 'easytravel/booking-service:latest'],
                        [name: 'easytravel-admin-service', dir: 'Backend/admin-service', tag: 'easytravel/admin-service:latest'],
                        [name: 'easytravel-notification-service', dir: 'Backend/notification-service', tag: 'easytravel/notification-service:latest'],
                        [name: 'easytravel-api-gateway', dir: 'Backend/api-gateway', tag: 'easytravel/api-gateway:latest'],
                        [name: 'easytravel-logging-service', dir: 'Backend/LoggingService/LoggingService', tag: 'easytravel/logging-service:latest'],
                        [name: 'easytravel-chatbot-service', dir: 'Backend/chatbot-service', tag: 'easytravel/chatbot-service:latest'],
                        [name: 'easytravel-frontend', dir: 'frontend', tag: 'easytravel/frontend:latest']
                    ]

                    for (svc in microservices) {
                        echo "🔨 Building ${svc.name} (${svc.tag})..."
                        sh "docker build -t ${svc.tag} ${svc.dir}"
                    }
                }
            }
        }

        stage('Deploy & Rollout in Kubernetes') {
            when {
                expression { return params.DEPLOY_TO_K8S == true }
            }
            steps {
                script {
                    echo "Applying Kubernetes manifests to namespace '${NAMESPACE}'..."
                    
                    // 1. Apply Kubernetes manifests
                    sh 'kubectl apply -f k8s/'

                    // 2. Trigger rolling restart of all application deployments to pick up new images
                    echo "Restarting deployments with new images..."
                    def deployments = [
                        'frontend',
                        'api-gateway',
                        'auth-service',
                        'booking-service',
                        'admin-service',
                        'notification-service',
                        'logging-service',
                        'chatbot-service',
                        'eureka-server'
                    ]

                    for (dep in deployments) {
                        sh "kubectl rollout restart deployment/${dep} -n ${NAMESPACE} || true"
                    }

                    // 3. Verify status
                    echo "Verifying deployment rollouts..."
                    sh "kubectl rollout status deployment/frontend -n ${NAMESPACE} --timeout=120s"
                    sh "kubectl rollout status deployment/api-gateway -n ${NAMESPACE} --timeout=120s"

                    echo "Current pod status in namespace '${NAMESPACE}':"
                    sh "kubectl get pods -n ${NAMESPACE}"
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. Cleaning up workspace..."
            cleanWs(cleanWhenAborted: true, cleanWhenFailure: true, cleanWhenNotBuilt: true, cleanWhenSuccess: true, cleanWhenUnstable: true)
        }
        success {
            echo "🎉 Pipeline completed successfully! EasyTravel is deployed and running on Kubernetes."
        }
        failure {
            echo "❌ Pipeline failed! Check the console logs for debugging details."
        }
    }
}
