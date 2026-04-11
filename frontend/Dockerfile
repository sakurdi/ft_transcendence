FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --verbose

COPY . .

EXPOSE 5173
# CMD ["npm", "run", "dev", "--", "--host"]
CMD ["sh", "-lc", "npm run build && npm run preview -- --host 0.0.0.0 --port 5173"]