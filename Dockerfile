# 1. Use Node.js version 20 on Alpine Linux
FROM node:20-alpine

# 2. Install openssl (Required by Prisma database client on Alpine)
RUN apk add --no-cache openssl

# 3. Create and set working directory inside the container
WORKDIR /app

# 4. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 5. Copy Prisma folder and generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# 6. Copy the rest of project files
COPY . .

# 7. Build the Next.js app
RUN npm run build

# 8. Environment variables (HOSTNAME="0.0.0.0" allows external connections)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# 9. Open port 3000
EXPOSE 3000

# 10. Start the Next.js production server
CMD ["npm", "start"]




