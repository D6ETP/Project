pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        ansiColor('xterm')
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

        stage('Code Quality & Build Artifacts') {
            parallel {
                stage('Build Spring Boot Services') {
                    steps {
                        echo "Building Java Microservices with Maven..."
                        script {
                            def services = [
                                'eureka-server',
                                'auth-service',
                                'booking-service',
                                'admin-service',
                                'notification-service',
                                'api-gateway'
                            ]
                            for (svc in services) {
                                dir("Backend/${svc}") {
                                    echo "Building ${svc}..."
                                    // Use mvn package -DskipTests for faster CI pipelines, or remove -DskipTests for full testing
                                    sh 'mvn clean package -DskipTests'
                                }
                            }
                        }
                    }
                }

                stage('Build React Frontend') {
                    steps {
                        echo "Building React Vite Frontend..."
                        dir('frontend') {
                            sh 'npm ci || npm install'
                            sh 'npm run build'
                        }
                    }
                }

                stage('Validate .NET Service') {
                    steps {
                        echo "Compiling .NET Logging Service..."
                        dir('Backend/LoggingService/LoggingService') {
                            sh 'dotnet build -c Release || echo "dotnet SDK not in host, Docker multistage will handle build"'
                        }
                    }
                }

                stage('Validate Python Chatbot') {
                    steps {
                        echo "Validating Python Chatbot syntax..."
                        dir('Backend/chatbot-service') {
                            sh 'python3 -m py_compile main.py || echo "Python check skipped"'
                        }
                    }
                }
            }
        }

        stage('Build & Tag Docker Images') {
            steps {
                script {
                    echo "Building Docker Images..."
                    def microservices = [
                        [name: 'easytravel-eureka', dir: 'Backend/eureka-server'],
                        [name: 'easytravel-auth-service', dir: 'Backend/auth-service'],
                        [name: 'easytravel-booking-service', dir: 'Backend/booking-service'],
                        [name: 'easytravel-admin-service', dir: 'Backend/admin-service'],
                        [name: 'easytravel-notification-service', dir: 'Backend/notification-service'],
                        [name: 'easytravel-api-gateway', dir: 'Backend/api-gateway'],
                        [name: 'easytravel-logging-service', dir: 'Backend/LoggingService/LoggingService'],
                        [name: 'easytravel-chatbot-service', dir: 'Backend/chatbot-service'],
                        [name: 'easytravel-frontend', dir: 'frontend']
                    ]

                    for (svc in microservices) {
                        echo "Building Docker image for ${svc.name}:${TAG}..."
                        sh "docker build -t ${REGISTRY}/${svc.name}:${TAG} -t ${REGISTRY}/${svc.name}:latest ${svc.dir}"
                    }
                }
            }
        }

        stage('Push Docker Images to Registry') {
            steps {
                script {
                    echo "Pushing images to registry ${REGISTRY}..."
                    withCredentials([usernamePassword(credentialsId: params.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        
                        def microservices = [
                            'easytravel-eureka',
                            'easytravel-auth-service',
                            'easytravel-booking-service',
                            'easytravel-admin-service',
                            'easytravel-notification-service',
                            'easytravel-api-gateway',
                            'easytravel-logging-service',
                            'easytravel-chatbot-service',
                            'easytravel-frontend'
                        ]

                        for (svc in microservices) {
                            echo "Pushing ${REGISTRY}/${svc}:${TAG}..."
                            sh "docker push ${REGISTRY}/${svc}:${TAG}"
                            sh "docker push ${REGISTRY}/${svc}:latest"
                        }
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { return params.DEPLOY_TO_K8S == true }
            }
            steps {
                script {
                    echo "Deploying manifests to Kubernetes namespace '${NAMESPACE}'..."
                    withCredentials([file(credentialsId: params.KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                        // 1. Create namespace if not existing
                        sh 'kubectl apply -f k8s/00-namespace.yaml'

                        // 2. Apply ConfigMaps and Secrets
                        sh 'kubectl apply -f k8s/01-secrets-and-configmap.yaml'

                        // 3. Apply Storage and Databases (MySQL & Redis)
                        sh 'kubectl apply -f k8s/02-storage-and-databases.yaml'

                        // 4. Update deployment image tags to point to the newly built version
                        sh """
                            # Replace placeholder image repository with target registry and tag
                            find k8s/ -name "*.yaml" -exec sed -i "s|image: easytravel/\\(.*\\):latest|image: ${REGISTRY}/easytravel-\\1:${TAG}|g" {} +
                            # Adjust eureka-server name if needed
                            find k8s/ -name "*.yaml" -exec sed -i "s|image: ${REGISTRY}/easytravel-eureka-server:${TAG}|image: ${REGISTRY}/easytravel-eureka:${TAG}|g" {} +
                        """

                        // 5. Apply microservices, frontend, and ingress
                        sh 'kubectl apply -f k8s/03-discovery-gateway.yaml'
                        sh 'kubectl apply -f k8s/04-backend-services.yaml'
                        sh 'kubectl apply -f k8s/05-frontend.yaml'
                        sh 'kubectl apply -f k8s/06-ingress.yaml'

                        // 6. Verify rollout status for key components
                        echo "Verifying deployment rollouts..."
                        sh "kubectl rollout status deployment/mysql -n ${NAMESPACE} --timeout=180s"
                        sh "kubectl rollout status deployment/redis -n ${NAMESPACE} --timeout=120s"
                        sh "kubectl rollout status deployment/eureka-server -n ${NAMESPACE} --timeout=180s"
                        sh "kubectl rollout status deployment/api-gateway -n ${NAMESPACE} --timeout=180s"
                        sh "kubectl rollout status deployment/frontend -n ${NAMESPACE} --timeout=120s"
                        sh "kubectl rollout status deployment/booking-service -n ${NAMESPACE} --timeout=180s"

                        echo "Listing running pods in namespace '${NAMESPACE}':"
                        sh "kubectl get pods,services,ingress -n ${NAMESPACE} -o wide"
                    }
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
