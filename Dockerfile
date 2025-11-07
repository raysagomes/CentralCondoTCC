FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Roda tanto backend quanto frontend no dev
CMD ["npm", "run", "dev"]