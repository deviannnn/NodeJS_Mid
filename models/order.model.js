const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        customerId: { type: String, required: true, default: 'WG' },
        name: { type: String, required: true, default: 'Walk-in Guest' },
    },
    staff: {
        staffId: { type: String, required: true },
        name: { type: String, required: true }
    },
    totalAmount: { type: Number, required: true },
    items: [{
        book: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    payment: {
        method: { type: String, required: true, enum: ['cash', 'banking'], default: 'cash' },
        receive: { type: Number, required: true },
        change: { type: Number, required: true },
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;