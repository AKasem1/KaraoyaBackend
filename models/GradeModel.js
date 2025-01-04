const mongoose = require('mongoose');
const { Schema } = mongoose;

const gradeSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    enrolledCount: { 
        type: Number, 
        default: 0 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

const Grade = mongoose.model('Grade', gradeSchema);
module.exports = Grade;
