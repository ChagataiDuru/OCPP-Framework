#!/bin/bash

# Start management system
cd backend/management-system
npm run start:dev &

# Start charge-point-node
cd ../charge-point-node
npm run start:dev &

# Start frontend
cd ../../frontend/ocpp-csms-angular
ng serve &
