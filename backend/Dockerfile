# Development image for the Express API. Source is bind-mounted by docker-compose.yml.
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 8000

# --watch restarts the server when files change.
CMD ["node", "--watch", "src/index.js"]
