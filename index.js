const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');

// --- Configuración ---
const app = express();
const port = process.env.PORT || 8080;

// Conexión a las APIs de GCP (automáticamente usa las credenciales del entorno de Cloud Run)
const firestore = new Firestore();
const storage = new Storage();

// Nombre de tu bucket en Cloud Storage
const bucketName = 'bucket-insta-cloud-sami-2025';
const bucket = storage.bucket(bucketName);

// Configuración de Multer para manejar la subida de archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
});

// Servir archivos estáticos (nuestro index.html)
app.use(express.static(path.join(__dirname, '/')));

// --- RUTAS DE LA API ---

// 1. Ruta para subir la imagen y la descripción
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No se subió ningún archivo.');
    }
    if (!req.body.description) {
      return res.status(400).send('No se agregó ninguna descripción.');
    }

    // Crear un nombre único para el archivo
    const blobName = `${Date.now()}-${req.file.originalname}`;
    const blob = bucket.file(blobName);

    // Stream para subir el archivo al bucket
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    blobStream.on('error', (err) => res.status(500).send(err.message));

    blobStream.on('finish', async () => {
      // Hacer el archivo público (para que se vea en la web)
      // En un proyecto real, usarías URLs firmadas, pero esto es más simple para la demo y la CDN
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blobName}`;

      // Guardar la metadata en Firestore
      const post = {
        description: req.body.description,
        imageUrl: publicUrl,
        timestamp: new Date(),
      };

      await firestore.collection('posts').add(post);

      // Redirigir a la página principal
      res.redirect('/');
    });

    blobStream.end(req.file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al subir el archivo.');
  }
});

// 2. Ruta para obtener todos los posts
app.get('/posts', async (req, res) => {
  try {
    const posts = [];
    // Consultar Firestore, ordenados por fecha
    const snapshot = await firestore.collection('posts').orderBy('timestamp', 'desc').get();
    
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los posts.');
  }
});

// --- Iniciar Servidor ---
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});