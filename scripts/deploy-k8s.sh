#!/bin/bash

set -euo pipefail

###########################################
# TaskFlow Kubernetes Deployment Script
###########################################

NAMESPACE="taskflow"

DOCKER_USER="ajayapst"

BUILD_NUMBER="$1"

FRONTEND_IMAGE="${DOCKER_USER}/taskflow-frontend:${BUILD_NUMBER}"
USER_IMAGE="${DOCKER_USER}/taskflow-user-service:${BUILD_NUMBER}"
TASK_IMAGE="${DOCKER_USER}/taskflow-task-service:${BUILD_NUMBER}"

echo "=========================================="
echo " Starting TaskFlow Deployment"
echo " Build Number : ${BUILD_NUMBER}"
echo "=========================================="

echo ""
echo "Checking Kubernetes Cluster..."

kubectl get nodes

echo ""
echo "Applying Namespace..."

kubectl apply -f k8s/namespace.yaml

echo ""
echo "Applying ConfigMap..."

kubectl apply -f k8s/configmap.yaml

echo ""
echo "Applying Secret..."

kubectl apply -f k8s/secret.yaml

echo ""
echo "Applying Services..."

kubectl apply -f k8s/services/

echo ""
echo "Applying Deployments..."

kubectl apply -f k8s/deployments/

echo ""
echo "Applying Ingress..."

kubectl apply -f k8s/ingress.yaml

echo ""
echo "Updating Images..."

kubectl set image deployment/frontend \
frontend=${FRONTEND_IMAGE} \
-n ${NAMESPACE}

kubectl set image deployment/user-service \
user-service=${USER_IMAGE} \
-n ${NAMESPACE}

kubectl set image deployment/task-service \
task-service=${TASK_IMAGE} \
-n ${NAMESPACE}

echo ""
echo "Deployment Updated Successfully."