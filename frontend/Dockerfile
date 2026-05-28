# ---- Step 1: Build the Vite React App ----
FROM node:22.14.0-slim AS builder

WORKDIR /app

# Copy package files and install exact locked dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build


# ---- Step 2: Serve with Nginx ----
FROM nginx:alpine

# Remove curl from runtime image because Docker Scout reports high CVEs in curl
# and this frontend nginx container does not need curl to serve static files.
RUN apk del curl || true

# Copy build files to Nginx's default directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]