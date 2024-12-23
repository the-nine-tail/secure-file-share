# ---- Stage 1: Build the Next.js application ----
    FROM node:18-alpine AS build

    # Set the working directory inside the container
    WORKDIR /app
    
    # Copy package.json and package-lock.json (or yarn.lock)
    COPY package*.json ./
    # If using yarn, use: COPY yarn.lock ./
    
    # Install dependencies
    RUN npm install
    # If using yarn: RUN yarn install
    
    # Copy the rest of the Next.js code
    COPY . .
    
    # Build the Next.js app
    RUN npm run build
    # This will create the .next folder with the production build
    
    # ---- Stage 2: Production Container ----
    FROM node:18-alpine AS production
    
    # Set the working directory
    WORKDIR /app
    
    # Copy only package.json and package-lock.json for the production container
    COPY package*.json ./
    RUN npm install --production
    # This installs only production dependencies
    
    # Copy the build artifacts from the previous stage
    COPY --from=build /app/.next ./.next
    COPY --from=build /app/public ./public
    COPY --from=build /app/node_modules ./node_modules
    # Optionally, copy other needed config files (next.config.js, etc.)
    COPY --from=build /app/next.config.mjs ./
    COPY --from=build /app/package.json ./
    # If you're reading environment variables or have other config files, ensure they're copied, too.
    
    # Expose port (Next.js defaults to 3000)
    EXPOSE 3000
    
    # Command to start Next.js in production mode
    CMD ["npm", "start"]
    # If your package.json has "start": "next start"
    