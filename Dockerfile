FROM node:12-alpine as build-stage

WORKDIR /app

# install and cache app dependencies
COPY . /app/
COPY package.json /app/package.json
RUN npm install
EXPOSE 8000 
CMD npm start