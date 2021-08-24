# syntax=docker/dockerfile:1
FROM node:12-alpine
EXPOSE 80/tcp
EXPOSE 443/tcp
RUN apk add --no-cache npm python3 make g++
WORKDIR /app
COPY . .
RUN mkdir /config
VOLUME /config
WORKDIR /app/src
RUN mv config.example.json /config/config.json
RUN npm install
WORKDIR /app
RUN echo "cp /config/config.json /app/src/config.json && npm start" > startup.sh
RUN chmod +x startup.sh
ENTRYPOINT "/app/startup.sh"