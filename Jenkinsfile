pipeline {
    agent any

    stages {

        stage('Build Backend Docker Image') {
            steps {
                dir('Server') {
                    sh 'docker build -t grocery-backend .'
                }
            }
        }

        stage('Stop Old Backend Container') {
            steps {
                sh 'docker stop grocery-backend-container || true'
                sh 'docker rm grocery-backend-container || true'
            }
        }

        stage('Run Backend Container') {
            steps {
                sh 'docker run -d -p 5000:5000 --name grocery-backend-container grocery-backend'
            }
        }
    }
}