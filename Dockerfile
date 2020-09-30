FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

COPY fonts/* /usr/share/fonts/truetype/arial/

EXPOSE 8080
CMD [ "npm", "start" ]
