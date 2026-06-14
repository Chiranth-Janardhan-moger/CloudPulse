FROM node:22-alpine

WORKDIR /app

# Update packages to fix security vulnerabilities
RUN apk update && apk upgrade --no-cache

# Upgrade npm to latest to address vulnerabilities in bundled tools (picomatch, brace-expansion, ip-address)
RUN npm install -g npm@latest && npm cache clean --force

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
