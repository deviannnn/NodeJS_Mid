const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    barcode: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, required: true },
    publisher: { type: String, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    total_quantity: { type: Number, required: true },
    display_quantity: { type: Number, required: true },
    quantity_history: [
        {
            date: { type: Date, default: Date.now },
            quantity: { type: Number, required: true },
            type: { type: String, enum: ['display', 'sold', 'import'], required: true },
        },
    ],
    status: { type: Number, required: true, default: 1 },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;