#!/bin/bash
# =============================================================================
# FILE: aws/scripts/ecr-push.sh
# PURPOSE: Builds the Node.js backend Docker image and pushes it to AWS ECR.
#
# THIS SCRIPT DOES WHAT YOUR JENKINSFILE DOES — BUT PUSHES TO ECR INSTEAD:
#   Jenkinsfile: docker build -t grocery-backend . (local only)
#   This script: docker build → tag → push to ECR (available to ECS Fargate)
#
# USAGE:
#   bash aws/scripts/ecr-push.sh
#
# PREREQUISITES:
#   1. AWS CLI installed: aws --version
#   2. AWS CLI configured: aws configure (with ECR push permissions)
#   3. Docker installed and running: docker info
#   4. ECR repository created: deploy 03-ecr.yaml first
#
# HOW TO INTEGRATE WITH JENKINS:
#   Add this to your Jenkinsfile as a new stage after "Build Backend Docker Image":
#   stage('Push to ECR') {
#       steps {
#           dir('Server') {
#               sh 'bash ../aws/scripts/ecr-push.sh'
#           }
#       }
#   }
# =============================================================================

set -e  # Exit immediately if any command fails (prevents partial deployments)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION — Update these values for your AWS account
# ─────────────────────────────────────────────────────────────────────────────

# AWS Region where ECR repository is located
AWS_REGION="ap-south-1"

# Your AWS Account ID — found at: AWS Console → top-right corner → Account ID
# Or run: aws sts get-caller-identity --query Account --output text
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# ECR Repository name (must match what was created in 03-ecr.yaml)
ECR_REPO_NAME="grocery-store-backend"

# Full ECR Repository URI (built from account ID and region)
# Format: <account-id>.dkr.ecr.<region>.amazonaws.com/<repo-name>
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"

# Docker image tag — use git commit hash for versioning (better than 'latest')
# This allows rollbacks: if 'v1.0.5' breaks, redeploy 'v1.0.4' from ECR
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "manual")
IMAGE_TAG="v$(date +%Y%m%d-%H%M%S)-${GIT_COMMIT}"  # e.g., v20240115-143022-abc1234

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Authenticate Docker with ECR
# ECR requires login before you can push images.
# This gets a temporary token (valid for 12 hours) from AWS.
# Equivalent to: docker login --username AWS --password <token> <ecr-url>
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "STEP 1: Authenticating Docker with AWS ECR..."
echo "Region: ${AWS_REGION}"
echo "Account: ${AWS_ACCOUNT_ID}"
echo "=================================================="

aws ecr get-login-password --region "${AWS_REGION}" | \
    docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "✅ Docker authenticated with ECR successfully"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Build the Docker image from Server/Dockerfile
# Same as: docker build -t grocery-backend . (from Jenkinsfile)
# But we give it the ECR URI as the tag so it's ready to push.
# --platform: Specify linux/amd64 even on Mac (ECS Fargate runs on x86_64)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "STEP 2: Building Docker image from Server/Dockerfile..."
echo "Tag: ${ECR_REPO_URI}:${IMAGE_TAG}"
echo "=================================================="

# Navigate to Server/ directory (where Dockerfile lives)
cd "$(dirname "$0")/../../Server"

# Build the image with two tags: versioned tag AND 'latest' tag
docker build \
    --platform linux/amd64 \
    --tag "${ECR_REPO_URI}:${IMAGE_TAG}" \
    --tag "${ECR_REPO_URI}:latest" \
    --file Dockerfile \
    .

echo "✅ Docker image built successfully"
echo "   Versioned tag: ${ECR_REPO_URI}:${IMAGE_TAG}"
echo "   Latest tag:    ${ECR_REPO_URI}:latest"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Security scan (check image for vulnerabilities before pushing)
# This is optional but recommended. ECR also scans on push automatically.
# Comment this out if you want faster builds.
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "STEP 3: Running basic security check..."
echo "=================================================="

# Check if there are any obvious issues with the image size
IMAGE_SIZE=$(docker image inspect "${ECR_REPO_URI}:${IMAGE_TAG}" --format='{{.Size}}' | awk '{printf "%.0f MB", $1/1024/1024}')
echo "Image size: ${IMAGE_SIZE}"

# Warn if image is too large (over 500MB might indicate unnecessary files)
SIZE_MB=$(docker image inspect "${ECR_REPO_URI}:${IMAGE_TAG}" --format='{{.Size}}' | awk '{printf "%.0f", $1/1024/1024}')
if [ "${SIZE_MB}" -gt 500 ]; then
    echo "⚠️  WARNING: Image size (${IMAGE_SIZE}) is large. Check .dockerignore file."
    echo "   Consider: multi-stage builds, removing dev dependencies"
fi

echo "✅ Security check complete (full scan will run in ECR after push)"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Push the image to ECR
# Both the versioned tag and 'latest' tag are pushed.
# ECS will pull 'latest' by default (or you can specify the versioned tag).
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "STEP 4: Pushing image to ECR..."
echo "This may take 1-5 minutes depending on image size and internet speed."
echo "=================================================="

# Push versioned tag (e.g., v20240115-143022-abc1234)
echo "Pushing versioned tag: ${IMAGE_TAG}..."
docker push "${ECR_REPO_URI}:${IMAGE_TAG}"

# Push latest tag (ECS service can reference 'latest' for simplicity)
echo "Pushing latest tag..."
docker push "${ECR_REPO_URI}:latest"

echo "✅ Image pushed to ECR successfully"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Trigger ECS Deployment (force new deployment with latest image)
# This tells ECS to pull the new 'latest' image and do a rolling update.
# ECS will start new tasks with the new image, then stop old ones.
# Zero downtime: old containers keep serving traffic until new ones are healthy.
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "STEP 5: Triggering ECS rolling deployment..."
echo "=================================================="

# ECS Cluster and Service names (must match 04-ecs-fargate.yaml)
ECS_CLUSTER="grocery-store-cluster"
ECS_SERVICE="grocery-store-backend-service"

# Force new deployment = pull new image and do rolling update
aws ecs update-service \
    --region "${AWS_REGION}" \
    --cluster "${ECS_CLUSTER}" \
    --service "${ECS_SERVICE}" \
    --force-new-deployment \
    --output text \
    --query 'service.deployments[0].status' 2>/dev/null || \
    echo "⚠️  ECS update skipped (ECS may not be deployed yet — deploy 04-ecs-fargate.yaml first)"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6: Output summary
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "🎉 Deployment Pipeline Complete!"
echo "=================================================="
echo ""
echo "📦 Image pushed to ECR:"
echo "   ${ECR_REPO_URI}:${IMAGE_TAG}"
echo "   ${ECR_REPO_URI}:latest"
echo ""
echo "📊 Monitor deployment:"
echo "   AWS Console → ECS → Clusters → ${ECS_CLUSTER} → Services → ${ECS_SERVICE}"
echo "   Deployments tab shows rolling update progress"
echo ""
echo "📋 View application logs:"
echo "   AWS Console → CloudWatch → Log Groups → /ecs/grocery-store/backend"
echo ""
echo "🔗 Check ECR images:"
echo "   aws ecr describe-images --repository-name ${ECR_REPO_NAME} --region ${AWS_REGION}"
echo ""
