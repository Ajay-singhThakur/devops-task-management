pipeline {
    agent any

    environment {
        REGISTRY = "docker.io"

        DOCKERHUB_USER = "ajayapst"

        FRONTEND_IMAGE = "${DOCKERHUB_USER}/taskflow-frontend"
        USER_IMAGE     = "${DOCKERHUB_USER}/taskflow-user-service"
        TASK_IMAGE     = "${DOCKERHUB_USER}/taskflow-task-service"

        IMAGE_TAG = "${BUILD_NUMBER}"

        K8S_HOST = "15.252.102.247"
    }

    stages {

        stage('Pre Check') {
            steps {
                sh '''
                    echo "=========================================="
                    echo " Environment Check"
                    echo "=========================================="

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
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

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
                    echo "=========================================="
                    echo " Building Docker Images"
                    echo "=========================================="

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
                    echo "=========================================="
                    echo " Pushing Docker Images"
                    echo "=========================================="

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
                        echo "=========================================="
                        echo " Deploying to Kubernetes"
                        echo " Build: ${BUILD_NUMBER}"
                        echo "=========================================="

                        ssh -o StrictHostKeyChecking=no ubuntu@${K8S_HOST} '
                            set -e

                            cd ~/devops-task-management

                            echo "Syncing deployment server with GitHub..."

                            git fetch origin
                            git reset --hard origin/main

                            echo "Starting Kubernetes deployment..."

                            ./scripts/deploy-k8s.sh ${BUILD_NUMBER}
                        '
                    """
                }
            }
        }
    }
}