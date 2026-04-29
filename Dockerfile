# =============================================================================
# Dockerfile - Nuxt 4 + Prisma + Auth Base Template
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS dependencies

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias SIN ejecutar postinstall (no tenemos el código fuente aún)
RUN pnpm install --frozen-lockfile --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app

# Copiar dependencias instaladas
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./package.json

# Copiar todo el código fuente
COPY . .

# Aprobar builds de paquetes nativos para pnpm 10
RUN pnpm approve-builds @parcel/watcher @prisma/engines bcrypt esbuild prisma vue-demi || true

# Variables de entorno para el build
ENV NODE_ENV=production
ENV NUXT_TELEMETRY_DISABLED=1

# Generar cliente Prisma y preparar Nuxt
RUN pnpm prisma generate
RUN pnpm nuxt prepare

# Build de la aplicación Nuxt
RUN pnpm build

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Instalar herramientas necesarias
RUN apk add --no-cache wget ca-certificates

WORKDIR /app

# Crear usuario no-root para ejecutar la aplicación
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxt -u 1001

# Copiar archivos necesarios desde el builder
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxt:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nuxt:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nuxt:nodejs /app/prisma ./prisma

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV NUXT_TELEMETRY_DISABLED=1
ENV NITRO_PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Exponer puerto
EXPOSE 3000

# Cambiar a usuario no-root
USER nuxt

# Comando de inicio
CMD ["node", ".output/server/index.mjs"]
