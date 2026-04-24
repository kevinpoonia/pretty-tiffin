# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client (must run before tsc)
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 4000

# Start command
CMD ["npm", "start"]
