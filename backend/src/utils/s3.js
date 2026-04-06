const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME;

/**
 * Upload a buffer to S3
 * @param {string} key - S3 object key (filename)
 * @param {Buffer} buffer - file content
 * @param {string} contentType - MIME type
 */
async function uploadToS3(key, buffer, contentType = 'application/octet-stream') {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return key;
}

/**
 * Download a file from S3 and return as Buffer
 * @param {string} key - S3 object key
 */
async function downloadFromS3(key) {
  const response = await s3.send(new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));

  // Convert stream to buffer
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Delete a file from S3
 * @param {string} key - S3 object key
 */
async function deleteFromS3(key) {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}

module.exports = { uploadToS3, downloadFromS3, deleteFromS3 };
