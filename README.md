# NestJS CRUD Microservices

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Microservices](https://img.shields.io/badge/Microservices-FF6C37?style=for-the-badge&logo=node.js&logoColor=white)

</div>

A robust microservices-based CRUD application built with NestJS, featuring:

- ✨ Modular microservices architecture
- 🐘 PostgreSQL database integration with TypeORM
- 🌐 API Gateway for intelligent request routing
- 🐳 Docker setup for seamless deployment
- 📦 Shared DTOs library for type consistency across services

## 🏗️ System Architecture

This project implements a complete microservices architecture with the following components:

- **User Service**: Handles user CRUD operations (running on port 3001/4001)
- **Product Service**: Manages product inventory (running on port 3002/4002)
- **API Gateway**: Routes requests to appropriate services (running on port 3000)
- **PostgreSQL**: Database for persisting data
- **Shared Library**: Contains shared DTOs, constants, and utilities used across services

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running locally without Docker)

## 🚀 Getting Started

### Using Shell Scripts (Development)

The project uses shell scripts to manage dependencies and services:

```bash
# Install all dependencies
./install-deps.sh

# Increase file watchers (if needed on Linux)
./increase-watchers.sh
```

After installing dependencies, you can start each service individually:

```bash
# Start user service
cd user-service && npm run start:dev

# Start product service
cd product-service && npm run start:dev

# Start API gateway
cd api-gateway && npm run start:dev
```

### Using Docker (Recommended for Production)

The easiest way to run the entire application is with Docker Compose:

```bash
# Start all services
docker-compose up

# Build containers
docker-compose up --build

# Stop and remove containers
docker-compose down
```

This will start:
- PostgreSQL database
- User Service on ports 3001 (HTTP) and 4001 (Microservice)
- Product Service on ports 3002 (HTTP) and 4002 (Microservice)
- API Gateway on port 3000

## 📚 API Documentation

### User Service API

| Method | Endpoint       | Description      | Request Body                           | Response                                  |
|--------|----------------|------------------|----------------------------------------|-------------------------------------------|
| `POST`   | `/users`      | Create a user    | `{ "name": "John", "email": "john@example.com" }` | `201` Created with user object              |
| `GET`    | `/users`      | List all users   | -                                      | `200` Array of user objects                |
| `GET`    | `/users/:id`  | Get a user       | -                                      | `200` User object or `404` if not found    |
| `PATCH`  | `/users/:id`  | Update a user    | `{ "name": "Updated Name" }`           | `200` Updated user or `404` if not found   |
| `DELETE` | `/users/:id`  | Delete a user    | -                                      | `204` No content or `404` if not found     |

<details>
<summary>User Entity Structure</summary>

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "createdAt": "2025-04-09T10:00:00.000Z",
  "updatedAt": "2025-04-09T10:00:00.000Z"
}
```
</details>

### Product Service API

| Method | Endpoint             | Description        | Request Body                                        | Response                                  |
|--------|----------------------|--------------------|----------------------------------------------------|-------------------------------------------|
| `POST`   | `/products`          | Create a product   | `{ "name": "Product 1", "description": "Description", "price": 29.99, "stock": 100 }` | `201` Created with product object          |
| `GET`    | `/products`          | List all products  | -                                                  | `200` Array of product objects            |
| `GET`    | `/products/:id`      | Get a product      | -                                                  | `200` Product object or `404` if not found |
| `PATCH`  | `/products/:id`      | Update a product   | `{ "name": "Updated Product", "price": 39.99 }`    | `200` Updated product or `404` if not found|
| `PATCH`  | `/products/:id/stock`| Update stock       | `{ "stock": 50 }`                                  | `200` Updated product or `404` if not found|
| `DELETE` | `/products/:id`      | Delete a product   | -                                                  | `204` No content or `404` if not found     |

<details>
<summary>Product Entity Structure</summary>

```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "stock": 100,
  "createdAt": "2025-04-09T10:00:00.000Z",
  "updatedAt": "2025-04-09T10:00:00.000Z"
}
```
</details>

## 📂 Project Structure

```
nestjs-crud-microservices/
├── api-gateway/           # Routes requests to microservices
│   ├── src/               # Gateway source code
│   └── test/              # E2E and integration tests
├── user-service/          # User CRUD operations
│   ├── src/               # Service source code
│   └── test/              # E2E and integration tests
├── product-service/       # Product management
│   ├── src/               # Service source code
│   └── test/              # E2E and integration tests
├── libs/                  # Shared resources
│   └── src/
│       ├── dto/           # Data Transfer Objects
│       │   ├── users/     # User-related DTOs
│       │   └── products/  # Product-related DTOs
│       └── constants/     # Shared message patterns
├── tests/                 # Global test scripts
│   ├── run-all-tests.sh   # Run all tests across services
│   └── run-selective-tests.sh  # Run specific tests
├── docker-compose.yml     # Multi-container setup
└── README.md              # Documentation
```

## 🧪 Testing

The project includes comprehensive testing capabilities:

```bash
# Run all tests across all services
./tests/run-all-tests.sh

# Run selective tests with options
./tests/run-selective-tests.sh -s user-service -e  # Run only e2e tests for user service
./tests/run-selective-tests.sh -u  # Run only unit tests for all services
./tests/run-selective-tests.sh -c  # Run tests with coverage reports
```

For more options:

```bash
./tests/run-selective-tests.sh --help
```