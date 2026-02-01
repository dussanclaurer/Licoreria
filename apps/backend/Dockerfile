FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
# Install dependencies
RUN pnpm install --frozen-lockfile
# Build the backend
RUN pnpm --filter @licoreria/backend build

# Create a self-contained production deployment
# "deploy" creates a folder with the package and its production dependencies fully installed
RUN pnpm --filter @licoreria/backend deploy --prod /prod/backend

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the self-contained deployment (package.json + node_modules)
COPY --from=builder /prod/backend .

# Copy the compiled code explicitly (ensure we have the latest build)
COPY --from=builder /app/apps/backend/dist ./dist
# Copy prisma schema for migrations if needed (although usually we use the generated client)
COPY --from=builder /app/apps/backend/prisma ./prisma

USER node
EXPOSE 3000

CMD ["node", "dist/index.js"]
