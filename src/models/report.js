const { Schema, model } = require('mongoose');

const ReportSchema = new Schema({
    pid: Number,
    reported_by: Number,
    post_id: String,
    reason: Number,
    message: String,
    created_at: {
        type: Date,
        default: new Date()
    }
});

const REPORT = model('REPORT', ReportSchema);

module.exports = {
    ReportSchema,
    REPORT
};
