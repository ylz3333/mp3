// Load required packages
const mongoose = require('mongoose');

// Define our task schema
const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    deadline: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    assignedUser: {
        type: String,
        default: ""
    },
    assignedUserName: {
        type: String,
        default: "unassigned"
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false });

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema);

