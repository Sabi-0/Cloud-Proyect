# 1. Usar una imagen base oficial de Node.js
FROM node:18-slim

# 2. Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar el package.json y package-lock.json
COPY package*.json ./

# 4. Instalar las dependencias del proyecto
RUN npm install

# 5. Copiar el resto del código de la aplicación
COPY . .

# 6. Exponer el puerto en el que corre la app
EXPOSE 8080

# 7. El comando para iniciar la aplicación
CMD [ "npm", "start" ]