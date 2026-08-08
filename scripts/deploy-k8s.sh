#!/bin/bash

set -euo pipefail

########################################
# TaskFlow Kubernetes Deployment Script
########################################

NAMESPACE="taskflow"
DOCKER_USER="ajayapst"

BUILD_NUMBER="${1:-}"

if [[ -z "${BUILD_NUMBER}" ]]; then
    echo "ERROR: Build number is required."
    echo "Usage: ./scripts/deploy-k8s.sh <BUILD_NUMBER>"
    exit 1
fi

FRONTEND_IMAGE="${DOCKER_USER}/taskflow-frontend:${BUILD_NUMBER}"
USER_IMAGE="${DOCKER_USER}/taskflow-user-service:${BUILD_NUMBER}"
TASK_IMAGE="${DOCKER_USER}/taskflow-task-service:${BUILD_NUMBER}"

echo "=========================================="
echo " TaskFlow Kubernetes Deployment"
echo " Build       : ${BUILD_NUMBER}"
echo " Namespace   : ${NAMESPACE}"
echo "=========================================="

########################################
# 1. Verify Docker Images
########################################

verify_image() {

    local image="$1"

    echo ""
    echo ">>> Verifying image: ${image}"

    if docker manifest inspect "${image}" > /dev/null 2>&1; then
        echo ">>> Image exists: ${image}"
    else
        echo "ERROR: Image does not exist: ${image}"
        exit 1
    fi
}

verify_image "${FRONTEND_IMAGE}"
verify_image "${USER_IMAGE}"
verify_image "${TASK_IMAGE}"

########################################
# 2. Check Kubernetes Cluster
########################################

echo ""
echo ">>> Checking Kubernetes cluster..."

kubectl get nodes

########################################
# 3. Apply Namespace
########################################

echo ""
echo ">>> Applying Namespace..."

kubectl apply -f k8s/namespace.yaml

########################################
# 4. Apply ConfigMap
########################################

echo ""
echo ">>> Applying ConfigMap..."

kubectl apply -f k8s/configmap.yaml

########################################
# 5. Apply Secret
########################################

echo ""
echo ">>> Applying Secret..."

kubectl apply -f k8s/secret.yaml

########################################
# 6. Apply Services
########################################

echo ""
echo ">>> Applying Services..."

kubectl apply -f k8s/services/

########################################
# 7. Save Current Deployment Images
#    BEFORE applying/updating deployments
########################################

echo ""
echo ">>> Saving current deployment images..."

OLD_FRONTEND_IMAGE=$(kubectl get deployment frontend \
    -n "${NAMESPACE}" \
    -o jsonpath='{.spec.template.spec.containers[0].image}')

OLD_USER_IMAGE=$(kubectl get deployment user-service \
    -n "${NAMESPACE}" \
    -o jsonpath='{.spec.template.spec.containers[0].image}')

OLD_TASK_IMAGE=$(kubectl get deployment task-service \
    -n "${NAMESPACE}" \
    -o jsonpath='{.spec.template.spec.containers[0].image}')

echo "Previous Frontend Image: ${OLD_FRONTEND_IMAGE}"
echo "Previous User Image:     ${OLD_USER_IMAGE}"
echo "Previous Task Image:     ${OLD_TASK_IMAGE}"

########################################
# 8. Apply Deployments
########################################

echo ""
echo ">>> Applying Deployments..."

kubectl apply -f k8s/deployments/

########################################
# 9. Apply Ingress
########################################

echo ""
echo ">>> Applying Ingress..."

kubectl apply -f k8s/ingress.yaml

########################################
# 10. Rollback Function
########################################

rollback() {

    echo ""
    echo "=========================================="
    echo " DEPLOYMENT FAILED"
    echo " STARTING ROLLBACK"
    echo "=========================================="

    echo ""
    echo ">>> Restoring Frontend..."

    kubectl set image deployment/frontend \
        frontend="${OLD_FRONTEND_IMAGE}" \
        -n "${NAMESPACE}"

    echo ""
    echo ">>> Restoring User Service..."

    kubectl set image deployment/user-service \
        user-service="${OLD_USER_IMAGE}" \
        -n "${NAMESPACE}"

    echo ""
    echo ">>> Restoring Task Service..."

    kubectl set image deployment/task-service \
        task-service="${OLD_TASK_IMAGE}" \
        -n "${NAMESPACE}"

    echo ""
    echo ">>> Waiting for rollback..."

    kubectl rollout status deployment/frontend \
        -n "${NAMESPACE}" \
        --timeout=180s || true

    kubectl rollout status deployment/user-service \
        -n "${NAMESPACE}" \
        --timeout=180s || true

    kubectl rollout status deployment/task-service \
        -n "${NAMESPACE}" \
        --timeout=180s || true

    echo ""
    echo ">>> Current application state after rollback..."

    kubectl get deployments -n "${NAMESPACE}"
    kubectl get pods -n "${NAMESPACE}"

    echo ""
    echo ">>> Rollback completed."

    exit 1
}

########################################
# 11. Update Images
########################################

echo ""
echo ">>> Updating application images..."

kubectl set image deployment/frontend \
    frontend="${FRONTEND_IMAGE}" \
    -n "${NAMESPACE}"

kubectl set image deployment/user-service \
    user-service="${USER_IMAGE}" \
    -n "${NAMESPACE}"

kubectl set image deployment/task-service \
    task-service="${TASK_IMAGE}" \
    -n "${NAMESPACE}"

########################################
# 12. Rollout Verification
########################################

wait_for_rollout() {

    local deployment="$1"

    echo ""
    echo ">>> Waiting for ${deployment} rollout..."

    if kubectl rollout status deployment/"${deployment}" \
        -n "${NAMESPACE}" \
        --timeout=180s; then

        echo ">>> ${deployment} rollout successful."

    else

        echo "!!! ${deployment} rollout FAILED."

        rollback
    fi
}

wait_for_rollout "frontend"
wait_for_rollout "user-service"
wait_for_rollout "task-service"

########################################
# 13. Pod Verification
########################################

echo ""
echo ">>> Checking pods..."

kubectl get pods -n "${NAMESPACE}"

########################################
# 14. Deployment Verification
########################################

echo ""
echo ">>> Checking deployments..."

kubectl get deployments -n "${NAMESPACE}"

########################################
# 15. Final Success
########################################

echo ""
echo "=========================================="
echo " DEPLOYMENT SUCCESSFUL"
echo " Build: ${BUILD_NUMBER}"
echo "=========================================="