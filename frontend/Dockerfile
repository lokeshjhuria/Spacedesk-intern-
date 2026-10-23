# ---------------------------------------------
# Space Shooter Odyssey - Frontend Dockerfile
# Production Nginx Static Server
# ---------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies manifest
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build production assets
RUN npm run build

# ---------------------------------------------
# Web Server (Nginx)
# ---------------------------------------------
FROM nginx:alpine AS runner

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
