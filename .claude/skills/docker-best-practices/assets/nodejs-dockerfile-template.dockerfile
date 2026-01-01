# syntax=docker/dockerfile:1

# =============================================
# Node.js Application Dockerfile Template
# =============================================
# Best practices:
# - Multi-stage build for smaller images
# - Non-root user for security
# - Layer caching for faster builds
# - Production-only dependencies
# =============================================

# =============================================
# Base Stage
# =============================================
FROM node:20-alpine AS base

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# =============================================
# Dependencies Stage
# =============================================
FROM base AS deps

# Install libc6-compat if needed for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# =============================================
# Builder Stage
# =============================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm build

# Remove devDependencies, keep only production deps
RUN pnpm install --frozen-lockfile --prod

# =============================================
# Runner Stage (Production)
# =============================================
FROM base AS runner

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1))" || exit 1

# Start the application
CMD ["node", "dist/index.js"]


# =============================================
# Alternative: Next.js Standalone
# =============================================
# Uncomment below for Next.js applications
# Requires: output: 'standalone' in next.config.js
# =============================================

# FROM base AS nextjs-runner
#
# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1
#
# RUN addgroup --system --gid 1001 nodejs && \
#     adduser --system --uid 1001 nextjs
#
# COPY --from=builder /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
#
# USER nextjs
#
# EXPOSE 3000
# ENV PORT=3000
# ENV HOSTNAME="0.0.0.0"
#
# CMD ["node", "server.js"]
