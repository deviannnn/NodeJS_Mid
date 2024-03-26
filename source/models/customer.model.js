const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    phone: { type: String, required: true, unique: true },
    points: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;