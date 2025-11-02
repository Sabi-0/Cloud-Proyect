# 1. Usar una imagen base oficial de Node.js
FROM node:18-slim

# 2. Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar SÓLO el package.json
# Esta es la línea clave que soluciona el problema
COPY package.json ./

# 4. Instalar las dependencias (dentro de la nube)
# Esto creará el package-lock.json y node_modules en el contenedor
RUN npm install

# 5. Copiar el resto del código de la aplicación
COPY . .

# 6. Exponer el puerto en el que corre la app
EXPOSE 8080

# 7. El comando para iniciar la aplicación
CMD [ "npm", "start" ]