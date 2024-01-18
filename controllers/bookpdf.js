const Pdf = require('../models/bookPdf');
const path = require('path');
const fs = require('fs');
const filehelper = require('../util/file');
const WebSocket = require('ws');
exports.addPdf = async(req, res, next) =>
{
    const title = req.body.title;
    const pdf = req.file.path.replace("\\","/");
    const bookId = req.body.bookId;
    const pdfs = new Pdf({
        title: title,
        pdfBook: pdf,
        bookId: bookId
    });
    const results = await pdfs.save();
    res.status(200).json({message: "Results", results});
};
exports.downloadPdf = async (req, res, next) => {
    try {
      const pdfId = req.params.pdfId;
      const pdf = await Pdf.findById(pdfId);

      if (!pdf) {
        return res.status(404).json({ message: 'PDF not found' });
      }
  
      // Set the appropriate headers for the response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${pdf.pdfBook}`);
  
      // Convert the stored file path to an absolute path
      const filePath = path.join(__dirname, '..', pdf.pdfBook);
  
      // Notify clients about the start of the download
      const wss = req.app.get('wss');
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'download-start', pdfId }));
        }
      });
  
      // Stream the file content and send WebSocket updates
      const stream = fs.createReadStream(filePath);
      stream.on('data', (chunk) => {
        // Send chunks to the response stream
        res.write(chunk);
  
        // Notify clients about the download progress
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'download-progress', pdfId, chunk }));
          }
        });
      });
  
      // Handle the end of the stream
      stream.on('end', () => {
        res.end();
  
        // Notify clients about the completion of the download
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'test-message',content: 'This is a test message.', pdfId }));
          }
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };



exports.UpdatePdf = async(req, res, next) =>
  {
    const pdfId = req.param.pdfId;
    const title = req.body.title;
    const pdf = req.file.path.replace("\\","/");
    const bookId = req.body.bookId;
    Pdf.findById(pdfId).then(pdfs =>
        {
            if(!pdfs)
            {
                const error = new Error("Pdf Not Found");
                error.statusCode = 404;
                throw error;
            }
          pdfs.title = title;
          pdfs.bookId= bookId;
          if(pdf)
          {
            filehelper.deletefile(pdfs.pdfBook);
            pdfs.pdfBook=pdf;
          }
        const results = pdfs.save();
        return res.status(200).json({message: "Update Book", results});
        }).catch(err =>
            {
                if(!err.statusCode)
                {
                    err.statusCode=500;
                }
                next(err);
            });
  };
  exports.deletePdf = async(req, res, next) =>
  {
    const pdfId = req.params.pdfId;
    Pdf.findById(pdfId).then(pdfs =>
        {
            if(!pdfs)
            {
                const error = new Error('New Error');
                error.statusCode = 404;
                throw error;
            }
            filehelper.deletefile(pdfs.pdfBook);
            return Pdf.findByIdAndDelete(pdfId);
        }).then(results =>
            {
                console.log(results);
                res.status(200).json({message: "Deleted Books", results});
            }).catch(err =>
                {
                    if(!err.statusCode)
                    {
                        err.statusCode = 505;
                    }
                    next(err);
                });
  };
  exports.getPdfs = async(req, res, next) =>
  {
    const Pdfs =await Pdf.find();
    res.status(200).json({message: "Data", Pdfs});
  };