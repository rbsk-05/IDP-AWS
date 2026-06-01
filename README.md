# The Diagon Alley

A cloud-native, serverless e-commerce platform built on AWS that enables customers to browse products, search inventory, manage shopping carts, and place orders through a modern web application. The platform leverages fully managed AWS services and Infrastructure as Code (IaC) to deliver scalability, reliability, security, and operational efficiency without managing traditional servers.

---

## Overview

**The Diagon Alley** is a full-stack serverless marketplace designed to demonstrate modern cloud architecture and enterprise software engineering practices.

The application provides a complete shopping experience through a React-based frontend and a collection of AWS Lambda-powered backend services exposed through Amazon API Gateway. Product data, shopping carts, and order information are stored in Amazon DynamoDB, while Terraform is used to provision and manage the entire cloud infrastructure.

The project showcases how modern e-commerce systems can be built using event-driven and serverless design principles while maintaining high availability, automatic scalability, and low operational overhead.

---

## Key Features

### Product Catalog Management

* Browse available products
* View product details
* Manage inventory information
* Product creation, updates, and deletion

### Product Search

* Search products across the catalog
* Fast product discovery
* Optimized search experience

### Shopping Cart Management

* Add products to cart
* Remove products from cart
* Update product quantities
* View cart summary

### Order Processing

* Create and manage orders
* Store order information
* Event-driven order workflows
* Notification integration

### Fully Serverless Deployment

* No server management
* Automatic scaling
* High availability
* Cost-efficient architecture

### Infrastructure as Code

* Complete cloud provisioning using Terraform
* Modular infrastructure design
* Repeatable and consistent deployments

---

## System Architecture

<img width="1920" height="1080" alt="IDP" src="https://github.com/user-attachments/assets/acc57a52-bef7-4dfb-8736-d6fe96cda90c" />

The application follows a serverless architecture built entirely on AWS managed services.

```text
User
 │
 ▼
CloudFront
 │
 ▼
Amazon S3 (Frontend Hosting)
 │
 ▼
React Application
 │
 ▼
Amazon API Gateway
 │
 ├── Product Service
 ├── Search Service
 ├── Cart Service
 ├── Order Service
 └── Utility Service
      │
      ▼
AWS Lambda Functions
      │
      ▼
Amazon DynamoDB
      │
      ▼
Amazon SNS (Order Notifications)
```

---

## Request Flow

1. Users access the application through CloudFront.
2. CloudFront serves the React frontend hosted on Amazon S3.
3. The frontend communicates with backend APIs through Amazon API Gateway.
4. API Gateway routes requests to the appropriate AWS Lambda function.
5. Lambda functions execute business logic.
6. Data is stored and retrieved from Amazon DynamoDB.
7. Order-related workflows publish events through Amazon SNS.
8. Responses are returned to the frontend and presented to the user.

---

## AWS Services Used

### Amazon S3

Used for hosting the React frontend and serving static assets.

### Amazon CloudFront

Provides global content delivery, caching, and performance optimization.

### Amazon API Gateway

Acts as the public entry point for all backend APIs and routes requests to Lambda functions.

### AWS Lambda

Executes serverless business logic for product management, search, cart operations, and order processing.

### Amazon DynamoDB

Stores product data, shopping carts, order information, and application state.

### Amazon SNS

Handles event-driven notifications and order-related messaging workflows.

### Amazon CloudWatch

Provides monitoring, logging, metrics, and operational visibility.

### Terraform

Manages cloud infrastructure provisioning and deployment through Infrastructure as Code.

---

## Core Services

### Product Service

Responsible for managing the marketplace catalog.

**Capabilities**

* Create products
* Retrieve products
* Update products
* Delete products
* Inventory management

---

### Search Service

Responsible for product discovery.

**Capabilities**

* Search products
* Filter catalog entries
* Retrieve search results

---

### Cart Service

Responsible for shopping cart operations.

**Capabilities**

* Add items to cart
* Remove items from cart
* Update quantities
* Retrieve cart contents

---

### Order Service

Responsible for order lifecycle management.

**Capabilities**

* Create orders
* Store order records
* Retrieve order information
* Trigger notifications

---

### Utility Service

Provides auxiliary application functionality and testing workflows.

---

## API Overview

### Product APIs

* Product retrieval
* Product creation
* Product updates
* Product deletion

### Search APIs

* Product search
* Catalog lookup

### Cart APIs

* Add items to cart
* Remove items from cart
* Retrieve cart contents

### Order APIs

* Create orders
* Retrieve order details

### Utility APIs

* Application utility endpoints

---

## Infrastructure as Code

All cloud resources are provisioned and managed using Terraform.

### Terraform Modules

* Product Module
* Search Module
* Cart Module
* Order Module
* Frontend Module
* CloudFront Module
* Utility Module

This modular structure enables independent management of infrastructure components while maintaining consistency across deployments.

---

## Repository Structure

```text
The-Diagon-Alley/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── dist/
│
├── backend/
│   ├── product/
│   ├── cart/
│   ├── search/
│   ├── order/
│   └── easteregg/
│
├── terraform/
│   ├── modules/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── search/
│   │   ├── order/
│   │   ├── frontend/
│   │   ├── cloudfront/
│   │   └── easteregg/
│   │
│   ├── provider.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── main.tf
│
├── .github/
├── .gitignore
└── README.md
```

---

## Scalability & Reliability

The platform is designed using AWS managed services that automatically scale based on workload demand.

### Benefits

* Automatic scaling
* High availability
* Fault tolerance
* Low operational overhead
* Pay-as-you-use pricing model
* Serverless architecture

---

## Security Considerations

Security is incorporated throughout the platform architecture.

### Infrastructure Security

* AWS managed services
* Infrastructure as Code governance
* Controlled service integrations

### API Security

* API Gateway request management
* Secure service communication
* Lambda isolation

### Data Security

* Managed DynamoDB storage
* AWS-managed encryption capabilities
* Secure backend data handling

---

## Monitoring & Observability

Operational visibility is provided through AWS monitoring services.

### Monitoring Features

* Lambda execution metrics
* API Gateway monitoring
* DynamoDB performance tracking
* CloudWatch logs
* Error tracking and diagnostics

---

## Future Enhancements

* User authentication and authorization
* Payment gateway integration
* Recommendation engine
* Real-time notifications
* Advanced analytics dashboard
* Inventory forecasting
* CI/CD automation
* Multi-region deployment
* Enhanced search capabilities

---

## Learning Outcomes

This project demonstrates practical experience in:

* AWS Cloud Architecture
* Serverless Computing
* Infrastructure as Code (Terraform)
* REST API Development
* Event-Driven Architecture
* Amazon DynamoDB
* AWS Lambda
* Amazon API Gateway
* CloudFront & S3 Hosting
* Full-Stack Application Development
* Distributed System Design

---

## Author

Built and maintained with ❤️ for maximum security and simplicity. Repository: rbsk-05/IDP-AWS
