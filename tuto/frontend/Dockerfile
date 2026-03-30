FROM node:22-alpine

WORKDIR /frontend

COPY package.json ./

RUN npm install

COPY . .

# FROM node:22-alpine
# WORKDIR /app
# COPY --from=builder /app ./
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]