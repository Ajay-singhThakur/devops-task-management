pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "ajayapst/taskflow-frontend"
        USER_IMAGE = "ajayapst/taskflow-user-service"
        TASK_IMAGE = "ajayapst/taskflow-task-service"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build frontend') {
            steps {
                dir('frontend') {
                    sh 'docker build -t ${FRONTEND_IMAGE}:latest .'
                }
            }
        }

        stage('Build user service') {
            steps {
                dir ('services/user-service') {
                    sh 'docker build -t ${USER_IMAGE}:latest .'
                }
            }
        }

        stage('Build task service') {
            steps {
                dir('services/task-service') {
                    sh 'docker build -t ${TASK_IMAGE}:latest .'
                }
            }
        }

    }
}