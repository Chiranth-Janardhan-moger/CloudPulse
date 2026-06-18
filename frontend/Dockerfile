FROM node:26-alpine AS build

WORKDIR /app

# Update packages to fix security vulnerabilities
RUN apk update && apk upgrade --no-cache

# Upgrade npm to latest to address vulnerabilities in bundled tools (picomatch, brace-expansion, ip-address)
RUN npm install -g npm@latest && npm cache clean --force

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

# Update packages to fix security vulnerabilities
RUN apk update && apk upgrade --no-cache

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
