#!/bin/bash

set -euo pipefail
KUBECONFIG="/home/ubuntu/.kube/config"
export KUBECONFIG



########################################
# TaskFlow Kubernetes Deployment
########################################

NAMESPACE="taskflow"
DOCKER_USER="ajayapst"

BUILD_NUMBER="${1:-}"

if [[ -z "${BUILD_NUMBER}" ]]; then
    echo "ERROR: Build number is required."
    echo "Usage: ./deploy-k8s.sh <BUILD_NUMBER>"
    exit 1
fi

FRONTEND_IMAGE="${DOCKER_USER}/taskflow-frontend:${BUILD_NUMBER}"
USER_IMAGE="${DOCKER_USER}/taskflow-user-service:${BUILD_NUMBER}"
TASK_IMAGE="${DOCKER_USER}/taskflow-task-service:${BUILD_NUMBER}"

echo "=========================================="
echo " TaskFlow Kubernetes Deployment"
echo " Build     : ${BUILD_NUMBER}"
echo " Namespace : ${NAMESPACE}"
echo "=========================================="

########################################
# 1. Validate Required Files
########################################

echo ""
echo ">>> Validating deployment files..."

REQUIRED_FILES=(
    "namespace.yaml"
    "configmap.yaml"
    "ingress.yaml"

    "services/frontend-service.yaml"
    "services/user-service.yaml"
    "services/task-service.yaml"

    "deployments/frontend-deployment.yaml"
    "deployments/user-service-deployment.yaml"
    "deployments/task-service-deployment.yaml"
)

for file in "${REQUIRED_FILES[@]}"; do

    if [[ ! -f "${file}" ]]; then
        echo "ERROR: Required file not found: ${file}"
        exit 1
    fi

done

echo ">>> All required files are present."

########################################
# 2. Check Kubernetes Cluster
########################################

echo ""
echo ">>> Checking Kubernetes cluster..."

if ! kubectl get nodes; then

    echo "ERROR: Kubernetes cluster is unavailable."

    exit 1

fi

########################################
# 3. Apply Namespace
########################################

echo ""
echo ">>> Applying namespace..."

kubectl apply -f namespace.yaml

########################################
# 4. Verify Namespace
########################################

echo ""
echo ">>> Verifying namespace..."

kubectl get namespace "${NAMESPACE}"

########################################
# 5. Verify Kubernetes Secret
########################################

echo ""
echo ">>> Checking Kubernetes secret..."

if kubectl get secret taskflow-secret \
    -n "${NAMESPACE}" > /dev/null 2>&1; then

    echo ">>> taskflow-secret exists."

else

    echo ""
    echo "ERROR: taskflow-secret does not exist."
    echo ""
    echo "The Jenkins pipeline must create the Kubernetes"
    echo "Secret before running this deployment script."
    echo ""

    exit 1

fi

########################################
# 6. Apply ConfigMap
########################################

echo ""
echo ">>> Applying ConfigMap..."

kubectl apply -f configmap.yaml

########################################
# 7. Apply Services
########################################

echo ""
echo ">>> Applying Services..."

kubectl apply -f services/

########################################
# 8. Save Existing Images
########################################

echo ""
echo ">>> Saving current deployment images..."

OLD_FRONTEND_IMAGE=""
OLD_USER_IMAGE=""
OLD_TASK_IMAGE=""

if kubectl get deployment frontend \
    -n "${NAMESPACE}" > /dev/null 2>&1; then

    OLD_FRONTEND_IMAGE=$(
        kubectl get deployment frontend \
            -n "${NAMESPACE}" \
            -o jsonpath='{.spec.template.spec.containers[0].image}'
    )

    echo "Previous Frontend Image: ${OLD_FRONTEND_IMAGE}"

else

    echo "Frontend deployment does not exist yet."

fi


if kubectl get deployment user-service \
    -n "${NAMESPACE}" > /dev/null 2>&1; then

    OLD_USER_IMAGE=$(
        kubectl get deployment user-service \
            -n "${NAMESPACE}" \
            -o jsonpath='{.spec.template.spec.containers[0].image}'
    )

    echo "Previous User Image: ${OLD_USER_IMAGE}"

else

    echo "User-service deployment does not exist yet."

fi


if kubectl get deployment task-service \
    -n "${NAMESPACE}" > /dev/null 2>&1; then

    OLD_TASK_IMAGE=$(
        kubectl get deployment task-service \
            -n "${NAMESPACE}" \
            -o jsonpath='{.spec.template.spec.containers[0].image}'
    )

    echo "Previous Task Image: ${OLD_TASK_IMAGE}"

else

    echo "Task-service deployment does not exist yet."

fi

########################################
# 9. Apply Deployments
########################################

echo ""
echo ">>> Applying Deployments..."

kubectl apply -f deployments/

########################################
# 10. Apply Ingress
########################################

echo ""
echo ">>> Applying Ingress..."

kubectl apply -f ingress.yaml

########################################
# 11. Update Application Images
########################################

echo ""
echo ">>> Updating application images..."

echo "Frontend:"
echo "  ${FRONTEND_IMAGE}"

kubectl set image deployment/frontend \
    frontend="${FRONTEND_IMAGE}" \
    -n "${NAMESPACE}"


echo ""
echo "User Service:"
echo "  ${USER_IMAGE}"

kubectl set image deployment/user-service \
    user-service="${USER_IMAGE}" \
    -n "${NAMESPACE}"


echo ""
echo "Task Service:"
echo "  ${TASK_IMAGE}"

kubectl set image deployment/task-service \
    task-service="${TASK_IMAGE}" \
    -n "${NAMESPACE}"

########################################
# 12. Rollback Function
########################################

rollback() {

    echo ""
    echo "=========================================="
    echo " DEPLOYMENT FAILED"
    echo " STARTING ROLLBACK"
    echo "=========================================="

    ########################################
    # Frontend Rollback
    ########################################

    if [[ -n "${OLD_FRONTEND_IMAGE}" ]]; then

        echo ""
        echo ">>> Rolling back frontend..."

        kubectl set image deployment/frontend \
            frontend="${OLD_FRONTEND_IMAGE}" \
            -n "${NAMESPACE}"

    else

        echo ""
        echo ">>> No previous frontend deployment."

    fi


    ########################################
    # User Service Rollback
    ########################################

    if [[ -n "${OLD_USER_IMAGE}" ]]; then

        echo ""
        echo ">>> Rolling back user-service..."

        kubectl set image deployment/user-service \
            user-service="${OLD_USER_IMAGE}" \
            -n "${NAMESPACE}"

    else

        echo ""
        echo ">>> No previous user-service deployment."

    fi


    ########################################
    # Task Service Rollback
    ########################################

    if [[ -n "${OLD_TASK_IMAGE}" ]]; then

        echo ""
        echo ">>> Rolling back task-service..."

        kubectl set image deployment/task-service \
            task-service="${OLD_TASK_IMAGE}" \
            -n "${NAMESPACE}"

    else

        echo ""
        echo ">>> No previous task-service deployment."

    fi


    ########################################
    # Wait For Rollback
    ########################################

    echo ""
    echo ">>> Waiting for rollback..."

    if [[ -n "${OLD_FRONTEND_IMAGE}" ]]; then

        kubectl rollout status \
            deployment/frontend \
            -n "${NAMESPACE}" \
            --timeout=180s || true

    fi


    if [[ -n "${OLD_USER_IMAGE}" ]]; then

        kubectl rollout status \
            deployment/user-service \
            -n "${NAMESPACE}" \
            --timeout=180s || true

    fi


    if [[ -n "${OLD_TASK_IMAGE}" ]]; then

        kubectl rollout status \
            deployment/task-service \
            -n "${NAMESPACE}" \
            --timeout=180s || true

    fi


    ########################################
    # Show Current State
    ########################################

    echo ""
    echo ">>> Kubernetes state after rollback..."

    kubectl get deployments \
        -n "${NAMESPACE}"

    kubectl get pods \
        -n "${NAMESPACE}"

    echo ""
    echo ">>> Rollback completed."

    exit 1
}

########################################
# 13. Rollout Verification
########################################

wait_for_rollout() {

    local deployment="$1"

    echo ""
    echo "=========================================="
    echo " Waiting for ${deployment}"
    echo "=========================================="

    if kubectl rollout status \
        deployment/"${deployment}" \
        -n "${NAMESPACE}" \
        --timeout=180s; then

        echo ""
        echo ">>> ${deployment} rollout successful."

    else

        echo ""
        echo "!!! ${deployment} rollout FAILED."

        rollback

    fi
}

########################################
# 14. Verify All Rollouts
########################################

wait_for_rollout "frontend"
wait_for_rollout "user-service"
wait_for_rollout "task-service"

########################################
# 15. Verify Pods
########################################

echo ""
echo "=========================================="
echo " Pod Verification"
echo "=========================================="

kubectl get pods \
    -n "${NAMESPACE}" \
    -o wide

########################################
# 16. Verify Deployments
########################################

echo ""
echo "=========================================="
echo " Deployment Verification"
echo "=========================================="

kubectl get deployments \
    -n "${NAMESPACE}"

########################################
# 17. Verify Services
########################################

echo ""
echo "=========================================="
echo " Service Verification"
echo "=========================================="

kubectl get services \
    -n "${NAMESPACE}"

########################################
# 18. Verify Deployed Images
########################################

echo ""
echo "=========================================="
echo " Image Verification"
echo "=========================================="

DEPLOYED_FRONTEND_IMAGE=$(
    kubectl get deployment frontend \
        -n "${NAMESPACE}" \
        -o jsonpath='{.spec.template.spec.containers[0].image}'
)

DEPLOYED_USER_IMAGE=$(
    kubectl get deployment user-service \
        -n "${NAMESPACE}" \
        -o jsonpath='{.spec.template.spec.containers[0].image}'
)

DEPLOYED_TASK_IMAGE=$(
    kubectl get deployment task-service \
        -n "${NAMESPACE}" \
        -o jsonpath='{.spec.template.spec.containers[0].image}'
)

echo "Frontend:"
echo "${DEPLOYED_FRONTEND_IMAGE}"

echo ""
echo "User Service:"
echo "${DEPLOYED_USER_IMAGE}"

echo ""
echo "Task Service:"
echo "${DEPLOYED_TASK_IMAGE}"


########################################
# 19. Verify Build Number
########################################

echo ""

if [[ "${DEPLOYED_FRONTEND_IMAGE}" != "${FRONTEND_IMAGE}" ]]; then

    echo "ERROR: Frontend image verification failed."
    rollback

fi


if [[ "${DEPLOYED_USER_IMAGE}" != "${USER_IMAGE}" ]]; then

    echo "ERROR: User-service image verification failed."
    rollback

fi


if [[ "${DEPLOYED_TASK_IMAGE}" != "${TASK_IMAGE}" ]]; then

    echo "ERROR: Task-service image verification failed."
    rollback

fi

########################################
# 20. Deployment Successful
########################################

echo ""
echo "=========================================="
echo " TASKFLOW DEPLOYMENT SUCCESSFUL"
echo "=========================================="
echo ""
echo "Build:"
echo "${BUILD_NUMBER}"
echo ""
echo "Namespace:"
echo "${NAMESPACE}"
echo ""
echo "Frontend:"
echo "${FRONTEND_IMAGE}"
echo ""
echo "User Service:"
echo "${USER_IMAGE}"
echo ""
echo "Task Service:"
echo "${TASK_IMAGE}"
echo ""
echo "All rollouts completed successfully."
echo "=========================================="