pipeline {
    agent any

    environment {
        REGISTRY = "docker.io"
        DOCKER_USER = "ajayapst"
        FRONTEND_IMAGE = "${DOCKER_USER}/taskflow-frontend"
        USER_IMAGE = "${DOCKER_USER}/taskflow-user-service"
        TASK_IMAGE = "${DOCKER_USER}/taskflow-task-service"
        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_HOST = ""
    }

    stages {

        stage('Pre Check') {
            steps {
                sh '''
                echo "==== Environment Check ===="
                docker --version
                git --version
                docker info
                df -h
                docker system df
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER'
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]){

                sh '''
                echo "$DOCKER_PASS" | docker login \
                -u "$DOCKER_USER" \
                --password-stdin
                '''
                }
            }
        }

        stage('Build Images') {

            steps {

                sh '''
                docker build \
                -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                -t ${FRONTEND_IMAGE}:latest \
                frontend

                docker build \
                -t ${USER_IMAGE}:${IMAGE_TAG} \
                -t ${USER_IMAGE}:latest \
                services/user-service

                docker build \
                -t ${TASK_IMAGE}:${IMAGE_TAG} \
                -t ${TASK_IMAGE}:latest \
                services/task-service
                '''
            }

        }
        stage('Push Images') {
            steps {
                sh '''
                docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                docker push ${FRONTEND_IMAGE}:latest

                 docker push ${USER_IMAGE}:${IMAGE_TAG}
                 docker push ${USER_IMAGE}:latest

                 docker push ${TASK_IMAGE}:${IMAGE_TAG}
                 docker push ${TASK_IMAGE}:latest
                 '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sshagent(credentials: ['k8s-ssh']) {
                    sh """
                      shh -o StrictHostKeyChecking=no ubuntu@${K8S_HOST} '
                      set -e
                      cd ~/devops-task-management
                      echo "Updating deployment repository..."
                      git fetch origin
                      git reset --hard origin/main
                      chmod +x scripts/deploy-k8s.sh
                      echo "Starting kubernetes deployment..."
                      ./scripts/deploy-k8s.sh ${BUILD_NUMBER} '
                      """
                }
            }
        }


    }
}