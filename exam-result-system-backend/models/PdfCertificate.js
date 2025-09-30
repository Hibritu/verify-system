const mongoose = require('mongoose');

const pdfCertificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  encryptedUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PdfCertificate', pdfCertificateSchema);
