const { PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { s3Client, bucketName, useS3, region } = require('../config/s3');
const AppError = require('../utils/appError');

// Set up Multer memory storage (files are held in memory buffer)
const storage = multer.memoryStorage();

// File filter to restrict uploads to images only
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new AppError('Only image files (jpeg, jpg, png, webp, gif) are allowed!', 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Uploads a file buffer to S3 or local storage
 * @param {Express.Multer.File} file 
 * @returns {Promise<string>} The public URL of the uploaded image
 */
const uploadToStorage = async (file) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fileName = `hotels/${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExtension}`;

  if (useS3 && s3Client) {
    // 1. Upload to AWS S3
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Make the file publicly readable
        ACL: 'public-read'
      });

      await s3Client.send(command);
      
      // Construct public S3 Object URL
      // If bucket name contains dots or standard virtual hosts are preferred:
      return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error('S3 Upload failed, falling back to local file upload:', error.message);
      // Fall through to local upload if S3 upload fails
    }
  }

  // 2. Fallback: Save to Local File System
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExtension}`;
  const localPath = path.join(uploadsDir, localFileName);
  
  fs.writeFileSync(localPath, file.buffer);

  // Return a relative URL path that Express static middleware can serve
  return `/uploads/${localFileName}`;
};

module.exports = {
  upload,
  uploadToStorage
};
