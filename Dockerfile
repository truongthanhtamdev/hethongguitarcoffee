# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# 1. Cài dependencies
# better-sqlite3 là native addon: ảnh Alpine (musl) thường không có sẵn bản
# dựng trước nên phải tự biên dịch, vì vậy dùng ảnh Debian slim cho lành.
# ---------------------------------------------------------------------------
FROM node:24-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# 2. Build
# AUTH_SECRET chỉ là giá trị giả lúc build; secret thật truyền lúc chạy.
# ---------------------------------------------------------------------------
FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_SECRET=build-time-placeholder
RUN npm run build

# ---------------------------------------------------------------------------
# 3. Chạy
# ---------------------------------------------------------------------------
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Toàn bộ dữ liệu (SQLite) nằm ở đây — nhớ mount volume vào đúng đường dẫn này.
ENV DATA_DIR=/data

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs \
    && mkdir -p /data && chown nextjs:nodejs /data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "server.js"]
