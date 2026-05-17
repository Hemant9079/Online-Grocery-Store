pipeline {
    agent any

    environment {
        IMAGE_NAME = 'grocery-backend'
        CONTAINER_NAME = 'grocery-backend-container'
        ENV_FILE = '/var/jenkins_home/secrets/grocery-backend.env'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('Server') {
                    sh "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('Stop Old Backend Container') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm ${CONTAINER_NAME} || true"
            }
        }

        stage('Run Backend Container') {
            steps {
                // Pass env vars at RUNTIME via --env-file (not baked into image)
                // NODE_ENV=production ensures cookies use sameSite=None + secure=true
                // which is required for cross-origin requests from Vercel frontend
                sh """
                    docker run -d \
                        -p 5000:5000 \
                        --env-file ${ENV_FILE} \
                        -e NODE_ENV=production \
                        --restart unless-stopped \
                        --name ${CONTAINER_NAME} \
                        ${IMAGE_NAME}
                """
            }
        }

        stage('Health Check') {
            steps {
                // Jenkins runs inside Docker, so 'localhost' = Jenkins container
                // Backend is exposed on host at 172.17.0.1 (Docker host gateway)
                sh 'sleep 5'
                sh '''
                    HOST_IP=$(ip route | grep default | awk \'{print $3}\')
                    curl -f http://${HOST_IP}:5000/ || (echo "Health check failed!" && exit 1)
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Backend deployed successfully on port 5000'
        }
        failure {
            echo '❌ Deployment failed — check the logs above'
        }
    }
}