pipeline {

    agent any

    environment {
        DOCKERHUB_USER = "ajayapst"

        FRONTEND_IMAGE = "${DOCKERHUB_USER}/taskflow-frontend"
        USER_IMAGE     = "${DOCKERHUB_USER}/taskflow-user-service"
        TASK_IMAGE     = "${DOCKERHUB_USER}/taskflow-task-service"

        IMAGE_TAG = "${BUILD_NUMBER}"

        K8S_HOST = "15.252.102.247"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Pre Check') {
            steps {
                sh '''
                    set -e

                    echo "=========================================="
                    echo " Environment Check"
                    echo "=========================================="

                    git --version
                    docker --version
                    docker info
                    df -h

                    echo ""
                    echo "Workspace:"
                    pwd

                    echo ""
                    echo "Git commit:"
                    git rev-parse --short HEAD
                '''
            }
        }

        stage('Docker Login') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_PASS'
                    )
                ]) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo " Docker Hub Login"
                        echo "=========================================="

                        echo "$DH_PASS" | docker login \
                            -u "$DH_USER" \
                            --password-stdin
                    '''
                }
            }
        }

        stage('Build Images') {
            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo " Building Docker Images"
                    echo " Build: ${IMAGE_TAG}"
                    echo "=========================================="

                    echo ""
                    echo ">>> Building frontend..."

                    docker build \
                        --build-arg VITE_API_URL="/api/v1" \
                        -t "${FRONTEND_IMAGE}:${IMAGE_TAG}" \
                        -t "${FRONTEND_IMAGE}:latest" \
                        frontend

                    echo ""
                    echo ">>> Building user-service..."

                    docker build \
                        -t "${USER_IMAGE}:${IMAGE_TAG}" \
                        -t "${USER_IMAGE}:latest" \
                        services/user-service

                    echo ""
                    echo ">>> Building task-service..."

                    docker build \
                        -t "${TASK_IMAGE}:${IMAGE_TAG}" \
                        -t "${TASK_IMAGE}:latest" \
                        services/task-service

                    echo ""
                    echo ">>> Images built successfully."

                    docker images | grep taskflow
                '''
            }
        }

        stage('Push Images') {
            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo " Pushing Docker Images"
                    echo "=========================================="

                    docker push "${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    docker push "${FRONTEND_IMAGE}:latest"

                    docker push "${USER_IMAGE}:${IMAGE_TAG}"
                    docker push "${USER_IMAGE}:latest"

                    docker push "${TASK_IMAGE}:${IMAGE_TAG}"
                    docker push "${TASK_IMAGE}:latest"
                '''
            }
        }

        stage('Verify Images') {
            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo " Verifying Docker Images"
                    echo "=========================================="

                    echo "Checking frontend..."
                    docker manifest inspect \
                        "${FRONTEND_IMAGE}:${IMAGE_TAG}" > /dev/null

                    echo "Checking user-service..."
                    docker manifest inspect \
                        "${USER_IMAGE}:${IMAGE_TAG}" > /dev/null

                    echo "Checking task-service..."
                    docker manifest inspect \
                        "${TASK_IMAGE}:${IMAGE_TAG}" > /dev/null

                    echo ""
                    echo "All images verified successfully."
                '''
            }
        }

        stage('Prepare App EC2') {
            steps {

                sshagent(credentials: ['k8s-ssh']) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo " Preparing Kubernetes EC2"
                        echo "=========================================="

                        ssh -o StrictHostKeyChecking=no \
                            ubuntu@"${K8S_HOST}" \
                            'mkdir -p /tmp/taskflow-deploy && rm -rf /tmp/taskflow-deploy/*'
                    '''
                }
            }
        }
        stage('Bootstrap K3s Access') {
    steps {

        sshagent(credentials: ['k8s-ssh']) {

            sh '''
                set -e

                echo "=========================================="
                echo " Bootstrapping K3s Access"
                echo "=========================================="

                ssh -o StrictHostKeyChecking=no \
                    ubuntu@"${K8S_HOST}" '
                        set -e

                        echo ">>> Waiting for K3s..."

                        for i in $(seq 1 30); do
                            if sudo systemctl is-active --quiet k3s; then
                                echo ">>> K3s is running."
                                break
                            fi

                            echo ">>> K3s not ready yet. Waiting..."
                            sleep 5
                        done

                        if ! sudo systemctl is-active --quiet k3s; then
                            echo "ERROR: K3s is not running."
                            sudo systemctl status k3s --no-pager || true
                            exit 1
                        fi

                        echo ">>> Configuring kubectl for ubuntu..."

                        sudo mkdir -p /home/ubuntu/.kube

                        sudo cp \
                            /etc/rancher/k3s/k3s.yaml \
                            /home/ubuntu/.kube/config

                        sudo chown ubuntu:ubuntu \
                            /home/ubuntu/.kube/config

                        sudo chmod 600 \
                            /home/ubuntu/.kube/config

                        echo ">>> Testing Kubernetes access..."

                        kubectl get nodes

                        echo ">>> K3s access is ready."
                    '
            '''
        }
    }
}

        stage('Create Kubernetes Secret') {
            steps {

                withCredentials([
                    string(
                        credentialsId: 'taskflow-jwt-secret',
                        variable: 'JWT_SECRET'
                    ),
                    string(
                        credentialsId: 'taskflow-user-mongo-uri',
                        variable: 'USER_MONGO_URI'
                    ),
                    string(
                        credentialsId: 'taskflow-task-mongo-uri',
                        variable: 'TASK_MONGO_URI'
                    )
                ]) {

                    sshagent(credentials: ['k8s-ssh']) {

                        sh '''
                            set -e

                            echo "=========================================="
                            echo " Creating Kubernetes Secret"
                            echo "=========================================="

                            printf '%s\\n' \
                                "JWT_SECRET=${JWT_SECRET}" \
                                "USER_MONGO_URI=${USER_MONGO_URI}" \
                                "TASK_MONGO_URI=${TASK_MONGO_URI}" \
                            | ssh -o StrictHostKeyChecking=no \
                                ubuntu@"${K8S_HOST}" \
                                'kubectl create namespace taskflow --dry-run=client -o yaml | kubectl apply -f - && \
                                 kubectl create secret generic taskflow-secret \
                                 --namespace taskflow \
                                 --from-env-file=/dev/stdin \
                                 --dry-run=client \
                                 -o yaml | kubectl apply -f -'
                        '''
                    }
                }
            }
        }

        stage('Transfer Kubernetes Files') {
            steps {

                sshagent(credentials: ['k8s-ssh']) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo " Transferring Kubernetes Files"
                        echo "=========================================="

                        scp -o StrictHostKeyChecking=no \
                            k8s/namespace.yaml \
                            k8s/configmap.yaml \
                            k8s/ingress.yaml \
                            ubuntu@"${K8S_HOST}":/tmp/taskflow-deploy/

                        scp -r -o StrictHostKeyChecking=no \
                            k8s/services \
                            k8s/deployments \
                            ubuntu@"${K8S_HOST}":/tmp/taskflow-deploy/

                        scp -o StrictHostKeyChecking=no \
                            scripts/deploy-k8s.sh \
                            ubuntu@"${K8S_HOST}":/tmp/taskflow-deploy/
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {

                sshagent(credentials: ['k8s-ssh']) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo " Kubernetes Deployment"
                        echo " Build: ${IMAGE_TAG}"
                        echo "=========================================="

                        ssh -o StrictHostKeyChecking=no \
                            ubuntu@"${K8S_HOST}" \
                            "
                            set -e

                            cd /tmp/taskflow-deploy

                            chmod +x deploy-k8s.sh

                            ./deploy-k8s.sh ${IMAGE_TAG}
                            "
                    '''
                }
            }
        }
    }

    post {

        success {
            echo '''
==========================================
 TASKFLOW PIPELINE SUCCESSFUL
==========================================
'''
        }

        failure {
            echo '''
==========================================
 TASKFLOW PIPELINE FAILED
==========================================
Check the failed stage and Kubernetes rollout logs.
'''
        }

        always {
            sh '''
                docker logout || true
            '''
        }
    }
}