# Base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy project files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose Next.js server port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Start Next.js server
CMD ["npm", "start"]


