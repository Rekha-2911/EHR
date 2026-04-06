const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = process.env.AES_SECRET || 'ehr_aes_encryption_key_32chars!!';

// Encrypt a file buffer and save as .enc file
function encryptFile(inputPath, outputPath) {
  const fileData = fs.readFileSync(inputPath);
  const wordArray = CryptoJS.lib.WordArray.create(fileData);
  const encrypted = CryptoJS.AES.encrypt(wordArray, SECRET_KEY).toString();
  fs.writeFileSync(outputPath, encrypted, 'utf8');
}

// Decrypt a .enc file and return buffer
function decryptFile(encryptedPath) {
  const encryptedData = fs.readFileSync(encryptedPath, 'utf8');
  const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const typedArray = convertWordArrayToUint8Array(decrypted);
  return Buffer.from(typedArray);
}

function convertWordArrayToUint8Array(wordArray) {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const uint8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    uint8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return uint8;
}

// Encrypt text data
function encryptText(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

// Decrypt text data
function decryptText(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Encrypt a Buffer and return encrypted Buffer (for S3 uploads)
function encryptBuffer(inputBuffer) {
  const wordArray = CryptoJS.lib.WordArray.create(inputBuffer);
  const encrypted = CryptoJS.AES.encrypt(wordArray, SECRET_KEY).toString();
  return Buffer.from(encrypted, 'utf8');
}

// Decrypt a Buffer and return decrypted Buffer (for S3 downloads)
function decryptBuffer(encryptedBuffer) {
  const encryptedData = encryptedBuffer.toString('utf8');
  const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const typedArray = convertWordArrayToUint8Array(decrypted);
  return Buffer.from(typedArray);
}

module.exports = { encryptFile, decryptFile, encryptText, decryptText, encryptBuffer, decryptBuffer };
