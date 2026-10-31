# Development image for the Vite app. Source is bind-mounted by docker-compose.yml,
# so this image mainly provides Node and installed dependencies.
FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies first so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host 0.0.0.0 lets the port mapping reach the dev server from outside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
