const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    publication: {
        publisher: { type: String, required: true },
        year: { type: Number, required: true },
    },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        required: true,
        enum: ['in stock', 'out of stock', 'warning', 'new'],
        default: 'new'
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;