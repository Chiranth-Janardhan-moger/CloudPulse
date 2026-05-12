FROM node:26-alpine

WORKDIR /app

# Update packages to fix security vulnerabilities
RUN apk update && apk upgrade --no-cache

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
