# =============================================================================
# Anwar Al Wahah Store - Frontend React + Vite + TypeScript Dockerfile
# Multi-stage production build serving static bundles through Nginx
# =============================================================================

# Stage 1: Build Application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Clean installation of dependencies
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production Nginx Web Server
FROM nginx:alpine AS runner

# Remove default nginx config & html
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy built assets and custom nginx configuration
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
