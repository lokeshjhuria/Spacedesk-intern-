# ---------------------------------------------
# Space Shooter Odyssey - Backend Dockerfile
# Multi-stage production build
# ---------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# ---------------------------------------------
# Production Runner
# ---------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built code from builder
COPY --from=builder /app/dist ./dist
# Copy Swagger docs
COPY src/docs ./dist/docs

EXPOSE 5000

CMD ["node", "dist/server.js"]
