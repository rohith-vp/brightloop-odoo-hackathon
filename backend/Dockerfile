# Development image for the Express API. Source is bind-mounted by docker-compose.yml.
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

EXPOSE 8000

# --watch restarts the server when files change.
CMD ["node", "--watch", "src/index.js"]
