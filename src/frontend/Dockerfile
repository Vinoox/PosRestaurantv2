# Build
FROM node:24-alpine AS build

WORKDIR /app

COPY src/frontend/ ./

RUN npm install

RUN npm run build

# Runtime
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY src/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]