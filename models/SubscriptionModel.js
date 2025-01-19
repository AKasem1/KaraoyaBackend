const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    course_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course' 
    },
    lesson_id: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    price: {
        type: Number,
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
