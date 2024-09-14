const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

require('dotenv').config();

// Conección URI
const mongoURI = process.env.MONGODB_URI;

// Inicializar gfs
let gfs;

const initGFS = () => {
  const conn = mongoose.connection;
  conn.once("open", () => {
    try {
      gfs = new mongoose.mongo.GridFSBucket(conn.db, {
          bucketName: "uploads"
      });
      console.log('GridFS initialized');
  } catch (error) {
      console.error('Error initializing GridFS:', error);
  }
  });
};

// MongoDB conexión
const connectDB = async () => {
  try {
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB Atlas');
  } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1); 
  }
};

// Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "uploads"
          };
          resolve(fileInfo);
        });
      });
    }
  });
  
const upload = multer({ storage });

module.exports = { connectDB, gfs, upload, initGFS };