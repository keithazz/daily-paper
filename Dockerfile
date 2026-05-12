FROM node:22-alpine

WORKDIR /app

# Install dependencies before copying source so this layer is cached.
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate the Prisma client inside the container.
RUN npx prisma generate

EXPOSE 3000

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
