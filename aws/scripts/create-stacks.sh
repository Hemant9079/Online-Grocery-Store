#!/bin/bash
# =============================================================================
# FILE: aws/scripts/create-stacks.sh
# PURPOSE: Deploys ALL CloudFormation stacks in the correct order.
#          Run this script once to set up the entire AWS infrastructure.
#
# ORDER MATTERS: Stacks depend on each other (outputs become inputs).
#   1. VPC (networking foundation — everything else depends on this)
#   2. Security Groups (depend on VPC ID)
#   3. ECR (independent — Docker registry for images)
#   4. Secrets Manager (independent — store app secrets)
#   5. ECS Fargate + ALB (depends on VPC, Security Groups, ECR, Secrets)
#   6. S3 + CloudFront (independent — frontend hosting)
#   7. Monitoring (depends on ECS cluster and ALB being deployed)
#
# USAGE:
#   bash aws/scripts/create-stacks.sh
#
# TIME: Full deployment takes approximately 15-25 minutes.
#   VPC: ~3 min | SG: ~1 min | ECR: ~1 min | Secrets: ~2 min
#   ECS+ALB: ~8 min | S3+CF: ~10 min | Monitoring: ~2 min
#
# COST CHECK: After deployment, check AWS Cost Explorer to confirm pricing.
# =============================================================================

set -e  # Exit immediately on any error

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION — Update these for your deployment
# ─────────────────────────────────────────────────────────────────────────────

AWS_REGION="ap-south-1"  # Mumbai — closest AWS region to India
PROJECT_NAME="grocery-store"

# Alert email for CloudWatch alarms (update before running!)
ALERT_EMAIL="your-email@gmail.com"

# Script directory (to find CloudFormation templates)
SCRIPT_DIR="$(dirname "$0")"
CF_DIR="${SCRIPT_DIR}/../cloudformation"

# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

# Print a section header
print_header() {
    echo ""
    echo "════════════════════════════════════════════════════"
    echo " $1"
    echo "════════════════════════════════════════════════════"
}

# Get a CloudFormation stack output value
get_stack_output() {
    local STACK_NAME=$1
    local OUTPUT_KEY=$2
    aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --query "Stacks[0].Outputs[?OutputKey=='${OUTPUT_KEY}'].OutputValue" \
        --output text 2>/dev/null || echo ""
}

# Check if a stack already exists
stack_exists() {
    local STACK_NAME=$1
    aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --query "Stacks[0].StackStatus" \
        --output text 2>/dev/null || echo "DOES_NOT_EXIST"
}

# Deploy a CloudFormation stack
deploy_stack() {
    local STACK_NAME=$1
    local TEMPLATE_FILE=$2
    shift 2
    local EXTRA_PARAMS="$@"  # Additional --parameter-overrides flags

    echo ""
    echo "📦 Deploying stack: ${STACK_NAME}"
    echo "   Template: ${TEMPLATE_FILE}"

    STATUS=$(stack_exists "${STACK_NAME}")

    if [ "${STATUS}" != "DOES_NOT_EXIST" ]; then
        echo "   Stack already exists (status: ${STATUS}). Updating..."
    else
        echo "   Creating new stack..."
    fi

    aws cloudformation deploy \
        --template-file "${TEMPLATE_FILE}" \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides ProjectName="${PROJECT_NAME}" ${EXTRA_PARAMS} \
        --no-fail-on-empty-changeset \
        || { echo "❌ Stack deployment failed: ${STACK_NAME}"; exit 1; }

    echo "✅ Stack deployed successfully: ${STACK_NAME}"
}

# ─────────────────────────────────────────────────────────────────────────────
# PRE-FLIGHT CHECKS
# ─────────────────────────────────────────────────────────────────────────────
print_header "Pre-flight Checks"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install from: https://aws.amazon.com/cli/"
    exit 1
fi
echo "✅ AWS CLI: $(aws --version)"

# Check AWS credentials
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
if [ -z "${AWS_ACCOUNT_ID}" ]; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi
echo "✅ AWS Account: ${AWS_ACCOUNT_ID}"
echo "✅ AWS Region: ${AWS_REGION}"

# Check alert email is configured
if [ "${ALERT_EMAIL}" = "your-email@gmail.com" ]; then
    echo "⚠️  WARNING: ALERT_EMAIL not updated in this script."
    echo "   Update ALERT_EMAIL at the top of this file to receive alarm notifications."
fi

echo ""
echo "This will create the following CloudFormation stacks:"
echo "  1. ${PROJECT_NAME}-vpc            (VPC, Subnets, NAT Gateway)"
echo "  2. ${PROJECT_NAME}-sg             (Security Groups)"
echo "  3. ${PROJECT_NAME}-ecr            (ECR Repository + IAM Roles)"
echo "  4. ${PROJECT_NAME}-secrets        (Secrets Manager)"
echo "  5. ${PROJECT_NAME}-ecs            (ECS Fargate + ALB)"
echo "  6. ${PROJECT_NAME}-frontend       (S3 + CloudFront)"
echo "  7. ${PROJECT_NAME}-monitoring     (CloudWatch Alarms + Dashboard)"
echo ""
echo "Estimated time: 15-25 minutes"
echo "Estimated cost: ~\$65-130/month"
echo ""
read -p "Press Enter to start deployment (Ctrl+C to cancel)..."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Deploy VPC
# This is the networking foundation. All other stacks depend on this.
# Creates: VPC, 6 subnets, Internet Gateway, NAT Gateway, Route Tables
# ─────────────────────────────────────────────────────────────────────────────
print_header "STEP 1/7: Deploying VPC Infrastructure"
deploy_stack "${PROJECT_NAME}-vpc" "${CF_DIR}/01-vpc.yaml"

# Read VPC outputs for display
VPC_ID=$(get_stack_output "${PROJECT_NAME}-vpc" "VpcId")
echo ""
echo "📋 VPC Created:"
echo "   VPC ID: ${VPC_ID}"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Deploy Security Groups
# Depends on: VPC ID from Step 1
# Creates: ALB SG, ECS SG, Database SG with proper firewall rules
# ─────────────────────────────────────────────────────────────────────────────
print_header "STEP 2/7: Deploying Security Groups"
deploy_stack "${PROJECT_NAME}-sg" "${CF_DIR}/02-security-groups.yaml" "VpcId=${VPC_ID}"

ALB_SG=$(get_stack_output "${PROJECT_NAME}-sg" "ALBSecurityGroupId")
ECS_SG=$(get_stack_output "${PROJECT_NAME}-sg" "ECSSecurityGroupId")

echo ""
echo "📋 Security Groups Created:"
echo "   ALB SG: ${ALB_SG}"
echo "   ECS SG: ${ECS_SG}"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Deploy ECR Repository
# Independent — no dependencies on previous stacks
# Creates: ECR repository for Docker images + IAM roles for push/pull
# ─────────────────────────────────────────────────────────────────────────────
print_header "STEP 3/7: Deploying ECR Repository"
deploy_stack "${PROJECT_NAME}-ecr" "${CF_DIR}/03-ecr.yaml"

ECR_URI=$(get_stack_output "${PROJECT_NAME}-ecr" "ECRRepositoryUri")

echo ""
echo "📋 ECR Repository Created:"
echo "   URI: ${ECR_URI}"
echo ""
echo "⚠️  IMPORTANT: Push your Docker image to ECR BEFORE deploying ECS."
echo "   Run: bash aws/scripts/ecr-push.sh"
echo ""
read -p "Have you pushed your Docker image to ECR? Press Enter to continue..."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Deploy Secrets Manager
# Independent — stores all .env secrets securely
# IMPORTANT: Update secret values in AWS Console after this step!
# ─────────────────────────────────────────────────────────────────────────────
print_header "STEP 4/7: Deploying Secrets Manager"
echo ""
echo "⚠️  IMPORTANT: After this step, update secret values in AWS Console!"
echo "   AWS Console → Secrets Manager → grocery-store/* → Edit secret"
echo ""

deploy_stack "${PROJECT_NAME}-secrets" "${CF_DIR}/06-secrets-manager.yaml"

echo ""
echo "📋 Secrets Created (with placeholder values — UPDATE THEM NOW!):"
echo "   grocery-store/mongo-uri     → MONGO_URI"
echo "   grocery-store/jwt-secrets   → JWT_SECRET, JWT_REFRESH_SECRET"
echo "   grocery-store/razorpay      → RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET"
echo "   grocery-store/google-oauth  → GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
echo "   grocery-store/email         → EMAIL_USER, EMAIL_PASS"
echo ""
echo "🔑 Go update these secrets now:"
echo "   https://ap-south-1.console.aws.amazon.com/secretsmanager/listsecrets?region=ap-south-1"
echo ""
read -p "Have you updated the secrets with real values? Press Enter to continue..."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Deploy ECS Fargate + ALB
# Depends on: VPC, Security Groups, ECR (image must exist), Secrets Manager
# Creates: ECS Cluster, Task Definition, Service, ALB, Target Group
# NOTE: BackendImageUri must point to an existing ECR image
# ─────────────────────────────────────────────────────────────────────────────
print_header "STEP 5/7: Deploying ECS Fargate + ALB"

BACKEND_IMAGE_URI="${ECR_URI}:latest"

echo ""
echo "Using backend image: ${BACKEND_IMAGE_URI}"
echo "If this image doesn't exist in ECR, ECS deployment will fail."
echo ""

deploy_stack "${PROJECT_NAME}-ecs" "${CF_DIR}/04-ecs-fargate.yaml" \
    "BackendImageUri=${BACKEND_IMAGE_URI}"

ALB_DNS=$(get_stack_output "${PROJECT_NAME}-ecs" "ALBDnsName")

echo ""
echo "📋 ECS Infrastructure Created:"
echo "   ALB DNS: ${ALB_DNS}"
echo "   Backend API URL: http://${ALB_DNS}"
echo ""
echo "✅ Test the backend API:"
echo "   curl http://${ALB_DNS}/"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6: Deploy S3 + CloudFront (Frontend)
# Independent — frontend hosting infrastructure
# After this, run deploy-frontend.sh to upload the React build
# ─────────────────────────────────────────────────────────────────────────────
print_header "STEP 6/7: Deploying S3 + CloudFront (Frontend)"
deploy_stack "${PROJECT_NAME}-frontend" "${CF_DIR}/05-s3-cloudfront.yaml"

CF_DOMAIN=$(get_stack_output "${PROJECT_NAME}-frontend" "CloudFrontDomain")
CF_DIST_ID=$(get_stack_output "${PROJECT_NAME}-frontend" "CloudFrontDistributionId")
S3_BUCKET=$(get_stack_output "${PROJECT_NAME}-frontend" "FrontendBucketName")

echo ""
echo "📋 Frontend Infrastructure Created:"
echo "   S3 Bucket: ${S3_BUCKET}"
echo "   CloudFront Domain: ${CF_DOMAIN}"
echo "   CloudFront ID: ${CF_DIST_ID}"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7: Deploy Monitoring
# Depends on: ECS cluster and ALB being deployed (Step 5)
# Creates: CloudWatch Alarms, Dashboard, CloudTrail, SNS alerts
# ─────────────────────────────────────────────────────────────────────────────
print_header "STEP 7/7: Deploying CloudWatch Monitoring"

ECS_CLUSTER=$(get_stack_output "${PROJECT_NAME}-ecs" "ECSClusterName")
ECS_SERVICE=$(get_stack_output "${PROJECT_NAME}-ecs" "ECSServiceName")

deploy_stack "${PROJECT_NAME}-monitoring" "${CF_DIR}/07-monitoring.yaml" \
    "AlertEmail=${ALERT_EMAIL}" \
    "ECSClusterName=${ECS_CLUSTER}" \
    "ECSServiceName=${ECS_SERVICE}"

echo ""
echo "📋 Monitoring Created:"
echo "   Check your email (${ALERT_EMAIL}) and CONFIRM the SNS subscription!"
echo "   Dashboard: https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#dashboards:name=${PROJECT_NAME}-dashboard"

# ─────────────────────────────────────────────────────────────────────────────
# FINAL SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
print_header "🎉 AWS Infrastructure Deployment Complete!"

echo ""
echo "📋 Summary of all created resources:"
echo ""
echo "  🌐 Frontend (React App):"
echo "     URL: https://${CF_DOMAIN}"
echo "     S3:  s3://${S3_BUCKET}/"
echo ""
echo "  🔧 Backend (Node.js API):"
echo "     URL: http://${ALB_DNS}"
echo "     ECS: ${ECS_CLUSTER} / ${ECS_SERVICE}"
echo ""
echo "  🐳 Docker Images:"
echo "     ECR: ${ECR_URI}"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "  1. Deploy React frontend:"
echo "     Update CLOUDFRONT_DISTRIBUTION_ID in aws/scripts/deploy-frontend.sh"
echo "     Then run: bash aws/scripts/deploy-frontend.sh"
echo ""
echo "  2. Update frontend/.env.production:"
echo "     VITE_API_URL=http://${ALB_DNS}"
echo ""
echo "  3. Test the full application:"
echo "     Frontend: https://${CF_DOMAIN}"
echo "     Backend:  http://${ALB_DNS}/"
echo ""
echo "  4. Set up Route 53 (optional):"
echo "     Point your custom domain to ALB and CloudFront"
echo ""
echo "  5. Add SSL Certificate (optional):"
echo "     AWS Console → Certificate Manager → Request Certificate"
echo "     Then re-deploy 04-ecs-fargate.yaml with CertificateArn parameter"
echo ""
echo "  6. Confirm CloudWatch alert emails:"
echo "     Check inbox for: ${ALERT_EMAIL}"
echo ""
