FROM docker.io/library/node:20-alpine

# build the app
WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_ENV="production"
RUN npm ci
COPY . .

# run as the "node" user
USER 1000

# expose the HTTP service under the unprivileged (>1024) http-alt port
EXPOSE 8080

CMD [ "npm", "run", "start" ]
