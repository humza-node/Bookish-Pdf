const PdfControll = require('../controllers/bookpdf');
const express = require('express');
const router = express.Router();
router.post('/add-pdf',PdfControll.addPdf);
router.get('/download-pdf/:pdfId', PdfControll.downloadPdf);
router.put('/update-pdf/:pdfId', PdfControll.UpdatePdf);
router.delete('/delete-pdf/:pdfId', PdfControll.deletePdf);
router.get('/get-pdfs',PdfControll.getPdfs);
module.exports =router;