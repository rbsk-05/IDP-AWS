# IDP Serverless Architecture

## Architecture Overview

This project is built as a serverless storefront using AWS managed services.

- Frontend: React + Vite static app deployed to S3 and served through CloudFront.
- API: API Gateway routes requests to Lambda-backed microservices.
- Backend microservices:
  - `product` service for product CRUD operations.
  - `cart` service for user cart operations.
  - `search` service for product search.
- Data storage: DynamoDB tables for product and cart persistence.

## Services Used

- `AWS S3` for static frontend hosting.
- `AWS CloudFront` as the CDN in front of the S3 frontend.
- `AWS API Gateway` to expose REST API endpoints under `/api`.
- `AWS Lambda` for backend service logic.
- `AWS DynamoDB` for product and cart persistence.
- `AWS IAM` for Lambda execution and CloudFront/S3 access.

## DynamoDB Tables

### `tf-darshan-product-table`

- Primary key: `id` (String)
- Stored item attributes:
  - `id`
  - `name`
  - `price`
  - `category`
  - `stock`

This table is the main product catalog store. The product Lambda service reads, creates, updates, and deletes products here.

### `tf-darshan-cart-table`

- Primary key: `userId` (String)
- Stored item attributes:
  - `userId`
  - `items` (list of cart entries)

Each cart entry contains:

- `productId`
- `name`
- `price`
- `quantity`

The cart Lambda service stores and retrieves a user’s current cart contents in this table.

### Search behavior

The search Lambda service is wired to query the product catalog. In the current setup, it searches product data from the product table.

## Deployment Workflow

1. Authenticate to AWS:

   ```bash
   aws sso login --profile idp-sbx-trn-lab-01
   ```

2. Initialize Terraform:

   ```bash
   cd terraform
   terraform init
   ```

3. Review the planned infrastructure:

   ```bash
   terraform plan
   ```

4. Apply the infrastructure:

   ```bash
   terraform apply
   ```

5. Build the frontend:

   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

6. Deploy the generated `dist` folder to the S3 frontend bucket and invalidate CloudFront.

## Runtime URLs

After deployment, Terraform will output the API Gateway URL and CloudFront distribution domain.

Use the CloudFront URL to access the live frontend.

## Local Frontend Development

To run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```
