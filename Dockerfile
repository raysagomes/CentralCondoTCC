FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000 4000

# Roda tanto backend quanto frontend no dev
CMD ["npm", "run", "dev"]