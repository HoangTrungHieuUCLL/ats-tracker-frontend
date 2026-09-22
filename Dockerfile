# Multi-stage build: Node build stage -> static server stage.
# Not yet buildable — the Vite app is scaffolded in a later build phase.
# Kept here now so the repo matches the two-repo scaffold from day one.

FROM node:20-slim AS build
WORKDIR /app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
