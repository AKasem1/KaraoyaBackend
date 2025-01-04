const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Schema.Types.Decimal128, 
        required: true 
    },
    payment_method: { 
        type: String, 
        enum: ['wallet', 'external'], 
        default: 'external' 
    },
    payment_date: { 
        type: Date, 
        default: Date.now 
    },
    course: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course',
        required: true
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
