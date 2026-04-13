# IDP Serverless Architecture

## Infrastructure Deployment

1. Make sure you are logged into AWS SSO with the profile `idp-sbx-trn-lab-01`:
   ```bash
   aws sso login --profile idp-sbx-trn-lab-01
   ```

2. Initialize Terraform (this downloads the AWS provider and prepares your environment):
   ```bash
   cd terraform
   terraform init
   ```

3. Preview the infrastructure plan:
   ```bash
   terraform plan
   ```

4. Deploy the infrastructure:
   ```bash
   terraform apply
   ```

5. After successful deployment, Terraform will output your API Gateway URL, CloudFront URL, and Cognito details. You can configure these in your frontend/ React application.

## Local Development (Frontend)

To run the frontend:
```bash
cd frontend
npm install
npm run dev
```
