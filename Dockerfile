# Dockerfile — backend Node.js
FROM node:20-alpine
 
WORKDIR /app
 
# Instala dependências primeiro
COPY package*.json ./
RUN npm install --omit=dev
 
# Copia o restante do código
COPY . .
 
EXPOSE 3000
 
CMD ["node", "server.js"]
