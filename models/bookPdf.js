const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pdfSchema = new Schema(
    {
        title:
        {
            type: String,
            required: true
        },
        pdfBook:
        {
            type: String,
            required: true
        },
        bookId:
        {
type: String,
required: true,
ref: 'Book'
        }
    }
);
module.exports=mongoose.model("Pdfs",pdfSchema);