# Stage 1: builder
FROM node:20-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:20-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup --no-create-home appuser

COPY --from=builder /build/build ./build
COPY --from=builder /build/package.json .
COPY --from=builder /build/node_modules ./node_modules

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O- http://localhost:3000/health || exit 1

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", "build"]
