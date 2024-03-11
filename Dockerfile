FROM docker.io/library/node:20-alpine

# Build the app
WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_ENV="production"
RUN npm ci
COPY . .

# Run as the "node" user
USER 1000

# Expose the HTTP service under the unprivileged (>1024) http-alt port
EXPOSE 8080

CMD [ "npm", "run", "start" ]
