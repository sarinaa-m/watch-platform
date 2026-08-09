# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build:docker

# Stage 2: Production
FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

COPY .env /usr/share/nginx/html/.env
COPY env.sh /usr/share/nginx/html/env.sh
RUN chmod +x /usr/share/nginx/html/env.sh

WORKDIR /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "./env.sh && nginx -g 'daemon off;'"]
