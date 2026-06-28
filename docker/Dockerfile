# Novelo web image.
# Single, reliable image used by docker-compose for local development.
# Builds the Next.js app, then the entrypoint syncs the DB schema + seeds on boot.

FROM node:20-alpine

# Prisma needs OpenSSL on Alpine.
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json ./
RUN npm install

# Copy the rest of the source.
COPY . .

# Generate Prisma client + build the production bundle.
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

RUN chmod +x ./docker/entrypoint.sh
ENTRYPOINT ["./docker/entrypoint.sh"]
