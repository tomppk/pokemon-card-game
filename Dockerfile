FROM node:15.2.0-buster
WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD [ "npm", "start" ]