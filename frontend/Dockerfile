# Build context: repository root (the build generates the API client from api/openapi.yaml)

FROM node:24-alpine AS build
WORKDIR /workspace/frontend

COPY api/openapi.yaml /workspace/api/openapi.yaml
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# prebuild generates the RTK Query API from the OpenAPI spec, then tsc + vite build
RUN npm run build

# Unprivileged nginx: runs as non-root user and listens on 8080
FROM nginxinc/nginx-unprivileged:1.31-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
