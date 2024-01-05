const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');
const multer = require('multer');
const path = require('path');
const WebSocket = require('ws');
const app = express();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'pdfs');
    },
    filename: function (req, file, cb) {
      cb(null, uuidv4() + '.pdf'); // You might want to keep the original file extension, but this example appends '.pdf'
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  app.use(multer({ storage: storage, fileFilter: fileFilter }).single('pdf'));
  app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
app.use(bodyParser.json());
const Pdf = require('./routes/pdf');
app.use(Pdf);
mongoose.connect('mongodb+srv://admin:YNn6x41lUeGt1hFI@bookish.wyns0ux.mongodb.net/bookish')
.then(results => {
   const server = app.listen(3000);
   const wss = new WebSocket.Server({noServer: true});
   app.set('wss',wss);
   server.on('upgrade',(request, socket, head) =>
   {
wss.handleUpgrade(request, socket, head, (ws) =>
{
  wss.emit('connection',ws, request);
});
   });
wss.on('connection', (ws) =>
{
  ws.on('message', (message) =>
  {
    console.log("Received Message", message);
  });
});
})
.catch(err => {
    console.log(err);
});
