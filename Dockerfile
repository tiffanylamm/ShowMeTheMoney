# syntax=docker/dockerfile:1

# ---- Stage 1: install dependencies ----
# A separate stage so the (slow) npm install is cached and only re-runs
# when package.json / package-lock.json change.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Stage 2: build the app ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the Next.js app. output: "standalone" puts the result in
# .next/standalone. No secrets needed here since pages fetch data at runtime.
RUN npm run build

# ---- Stage 3: minimal runtime image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Run as a non-root user for safety.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy only what the standalone server needs to run.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
# standalone build emits server.js as the entrypoint.
CMD ["node", "server.js"]
