# ☁️ AWS Cloud Deployment Guide — Online Grocery Store

> ⚠️ **IMPORTANT**: All existing files (Jenkinsfile, Dockerfile, Server/, frontend/) are UNTOUCHED.
> This `aws/` folder contains only NEW files for the AWS upgrade.
> You can run both Jenkins (existing) and AWS CodePipeline (new) side by side.

---

## 📁 Folder Structure of This AWS Upgrade

```
aws/
├── cloudformation/
│   ├── 01-vpc.yaml              → VPC, Subnets, Internet Gateway, NAT Gateway, Route Tables
│   ├── 02-security-groups.yaml  → Security Groups for ALB, ECS, and Database
│   ├── 03-ecr.yaml              → Amazon ECR (Docker Image Registry)
│   ├── 04-ecs-fargate.yaml      → ECS Cluster, Task Definition, Service, ALB
│   ├── 05-s3-cloudfront.yaml    → S3 bucket + CloudFront CDN for React frontend
│   ├── 06-secrets-manager.yaml  → AWS Secrets Manager (replaces .env secrets)
│   └── 07-monitoring.yaml       → CloudWatch Logs, Alarms, Dashboard
├── scripts/
│   ├── ecr-push.sh              → Build Docker image and push to ECR
│   ├── deploy-frontend.sh       → Build React app and upload to S3
│   └── create-stacks.sh         → Deploy all CloudFormation stacks in order
└── README.md                    → This file
```

---

## 🚀 Quick Start — Deployment Order

### Step 1 — Prerequisites
- AWS CLI installed: `aws --version`
- AWS CLI configured: `aws configure` (enter Access Key, Secret Key, Region: ap-south-1)
- Docker installed (already exists for Jenkins)
- Node.js 18+ installed (already exists)

### Step 2 — Deploy CloudFormation Stacks (in order)
```bash
# Run from project root
bash aws/scripts/create-stacks.sh
```

Or deploy manually one by one:
```bash
# 1. VPC
aws cloudformation deploy --template-file aws/cloudformation/01-vpc.yaml --stack-name grocery-vpc --capabilities CAPABILITY_NAMED_IAM

# 2. Security Groups
aws cloudformation deploy --template-file aws/cloudformation/02-security-groups.yaml --stack-name grocery-sg --capabilities CAPABILITY_NAMED_IAM

# 3. ECR
aws cloudformation deploy --template-file aws/cloudformation/03-ecr.yaml --stack-name grocery-ecr --capabilities CAPABILITY_NAMED_IAM

# 4. Secrets Manager (fill in your values first!)
aws cloudformation deploy --template-file aws/cloudformation/06-secrets-manager.yaml --stack-name grocery-secrets --capabilities CAPABILITY_NAMED_IAM

# 5. ECS Fargate + ALB
aws cloudformation deploy --template-file aws/cloudformation/04-ecs-fargate.yaml --stack-name grocery-ecs --capabilities CAPABILITY_NAMED_IAM

# 6. S3 + CloudFront (Frontend)
aws cloudformation deploy --template-file aws/cloudformation/05-s3-cloudfront.yaml --stack-name grocery-frontend --capabilities CAPABILITY_NAMED_IAM

# 7. Monitoring
aws cloudformation deploy --template-file aws/cloudformation/07-monitoring.yaml --stack-name grocery-monitoring --capabilities CAPABILITY_NAMED_IAM
```

### Step 3 — Push Docker Image to ECR
```bash
bash aws/scripts/ecr-push.sh
```

### Step 4 — Deploy React Frontend to S3
```bash
bash aws/scripts/deploy-frontend.sh
```

---

## 🔑 Secrets to Add in AWS Secrets Manager

Before deploying, update `aws/cloudformation/06-secrets-manager.yaml` with your actual values OR
manually set them in AWS Console → Secrets Manager after deployment:

| Secret Name | Key | Value Source |
|---|---|---|
| `grocery/mongo-uri` | `MONGO_URI` | Your MongoDB Atlas connection string |
| `grocery/jwt-secret` | `JWT_SECRET` | Your JWT secret from Server/.env |
| `grocery/jwt-refresh` | `JWT_REFRESH_SECRET` | Your refresh secret |
| `grocery/razorpay` | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay dashboard |
| `grocery/google-oauth` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `grocery/email` | `EMAIL_USER`, `EMAIL_PASS` | Your email credentials |

---

## 🔗 Architecture Summary

```
User → Route 53 → CloudFront → S3 (React App)
User → Route 53 → ALB (HTTPS) → ECS Fargate (Node.js API)
ECS Fargate → MongoDB Atlas (Database)
ECS Fargate → AWS Secrets Manager (Secrets)
ECS Fargate → S3 (Product Images)
ECS Fargate → CloudWatch (Logs & Metrics)
GitHub → Jenkins (existing) OR CodePipeline (new) → ECR → ECS
```

---

## 💡 Jenkins + AWS Together (Hybrid CI/CD)

Your existing Jenkinsfile still works! To upgrade it to push to ECR:
- See `aws/scripts/ecr-push.sh` — you can call this script from Jenkins pipeline
- This way you keep Jenkins but use ECR instead of local Docker registry

---

## 📞 Support

For AWS pricing estimates: https://calculator.aws.amazon.com  
For MongoDB Atlas free tier: https://www.mongodb.com/cloud/atlas/register  
AWS Region used: **ap-south-1 (Mumbai)** — closest to India
