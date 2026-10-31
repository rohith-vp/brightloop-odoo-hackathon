# Development image for the Vite app. Source is bind-mounted by docker-compose.yml,
# so this image mainly provides Node and installed dependencies.
FROM node:22-bookworm-slim

WORKDIR /app

# Retry slow or stalled registry downloads instead of hanging the build.
ENV npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=300000 \
    npm_config_audit=false \
    npm_config_fund=false

# Install dependencies first so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# --host 0.0.0.0 lets the port mapping reach the dev server from outside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
