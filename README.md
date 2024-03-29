# OCPP Framework

The OCPP Framework is a robust Charge Station Management System implemented using NestJS on the backend, following a Microservices architecture. It leverages RabbitMQ for communication between microservices and MongoDB for data storage. The frontend, built with AngularJS, interacts with the management system to query information about charge stations and their status.

## Microservices

### 1. Charge Point Node (charge-point-node)

The Charge Point Node is a NestJS application designed to be deployed near real-world locations with multiple charge stations. It handles WebSocket events, responds to charge stations, and saves necessary information to the MongoDB database.

**Relevant Code Snippets:**
- `ocpp-service.ts`: Handles OCPP functionalities such as Boot Notification, Status Notification, Authorize, Start Transaction, Stop Transaction, Meter Values, etc.

### 2. Management System (management-system)

The Management System microservice processes events generated by charge-station-nodes through RabbitMQ. It has access to the MongoDB database and responds to frontend requests, providing information about charge stations, available connectors, charging status, and more.

## Frontend

The frontend consists of several pages, each serving a specific purpose:

- **Dashboard**: Overview of the charge station system.
- **Login**: Authentication for system access.
- **Map**: Visualization of charge stations on a map.
- **Stations**: Detailed information about charge stations.
- **Detail**: Information about a specific charge point.
- **Transactions**: Transaction history.

## Getting Started

## Running with Docker



## Running the Project Locally

To run the project locally, follow these steps:

1. Clone the repository.
2. Navigate to the project root directory.

### Step 1: Install Dependencies

#### Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend/ocpp-csms-angular

# Install Angular dependencies
npm install
```
#### Backend Dependencies
```bash
# Navigate to management system directory
cd backend/management-system

# Install Nest.js dependencies
npm install
```
### Step 2: Run the project

#### Option 1: Using Script

Run the following script to start the frontend, management system, and charge-point-node on root of the project:

```bash
./start.sh
```
#### Option 2: Manual Start
```bash
cd frontend/ocpp-csms-angular
ng serve
```
```bash
cd backend/management-system
npm run start:dev
```
```bash
cd backend/charge-point-node
npm run start:dev
```
### Step 3: Access to project

The project will be accessible at http://localhost:4200.

1. **Charge Point Node**:
   - Deploy the NestJS application in real-world locations near charge stations.
   - Handle WebSocket events, communicate with charge stations, and update the database.

2. **Management System**:
   - Deploy the NestJS application for centralized management.
   - Process events from charge-point-nodes via RabbitMQ.
   - Provide APIs for frontend queries and interact with the MongoDB database.

3. **Frontend**:
   - Utilize AngularJS for a dynamic and responsive user interface.
   - Make backend requests to the Management System for system information.

## Dependencies

- **Backend**:
  - NestJS for microservices.
  - RabbitMQ for communication.
  - MongoDB for data storage.

- **Frontend**:
  - AngularJS for dynamic web pages.

## Contributions

Contributions are welcome! Feel free to open issues, submit pull requests, or provide feedback.

## License

This project is licensed under the [MIT License](LICENSE).
