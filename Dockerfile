# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend-panel/package*.json ./frontend-panel/

# Install dependencies
RUN npm ci --only=production
RUN cd frontend-panel && npm ci --only=production

# Copy source code
COPY . .

# Build frontend
RUN cd frontend-panel && npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create necessary directories and set permissions
RUN mkdir -p backend/full/storage backend/full/logs
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "run", "start:production"]
