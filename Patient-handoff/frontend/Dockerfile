# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

# Stage 2: Serve the React application with Node.js/Express
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json for Node.js server dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the server.js file
COPY server.js .

# Command to run the Node.js server
CMD ["node", "server.js"]
