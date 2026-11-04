# -------------------------------------------------------------
# Space Shooter Odyssey - All-In-One Unified Docker Deployment
# Builds both Frontend & Backend into a single high-performance container
# Uses Debian slim for full glibc compatibility with embedded MongoDB
# -------------------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Copy root and workspace manifests
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm ci
RUN cd backend && npm ci

# Copy sources
COPY shared/ ./shared/
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build frontend and backend
RUN cd frontend && npm run build
RUN cd backend && npm run build

# -------------------------------------------------------------
# Production Runner
# -------------------------------------------------------------
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for healthchecks and ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy built artifacts
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/package.json ./package.json

# Create persistent storage directory
RUN mkdir -p /app/data/db

EXPOSE 5000

# Start backend which serves both the REST API and the React SPA
CMD ["node", "backend/dist/server.js"]
