FROM node:20-alpine AS base
# Instalar OpenSSL y dependencias nativas básicas necesarias para Prisma/Bcrypt
RUN apk add --no-cache openssl

FROM base AS builder
WORKDIR /app
# Copiar todo el monorepo para el build
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
# Generar cliente y compilar
RUN pnpm --filter @licoreria/backend exec prisma generate
RUN pnpm --filter @licoreria/backend build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# 1. Copiar package.json del backend
COPY apps/backend/package.json ./

# 2. Instalar dependencias de producción MANUALMENTE
# Esto garantiza que node_modules exista y sea compatible con Alpine
RUN npm install --omit=dev

# 3. Copiar código compilado y esquema
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
# Prisma Generate de nuevo para asegurar compatibilidad binaria en el runner final
RUN npx prisma generate

# 4. Asegurar permisos
RUN chown -R node:node /app

USER node
EXPOSE 3000

CMD ["node", "dist/index.js"]