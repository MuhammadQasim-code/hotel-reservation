const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

let s3Client = null;
let useS3 = false;

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME;

// S3 requires a bucket name to be configured
if (bucketName) {
  // If access keys are specified, use them (typically local development)
  // Otherwise, leave credentials empty to allow loading from the EC2 IAM Instance Profile
  const clientConfig = { region };
  
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
    console.log('S3 Client initialized with environment Access Key ID.');
  } else {
    console.log('S3 Client initialized. Relying on IAM Instance Profile / default credential provider.');
  }

  try {
    s3Client = new S3Client(clientConfig);
    useS3 = true;
  } catch (error) {
    console.error('Failed to initialize S3 Client, falling back to local storage:', error.message);
  }
} else {
  console.log('AWS_S3_BUCKET_NAME is not set. Falling back to local storage for hotel images.');
}

module.exports = {
  s3Client,
  bucketName,
  useS3,
  region
};
