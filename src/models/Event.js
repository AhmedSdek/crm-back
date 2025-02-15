import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: String,
    start: String,
    end: String,
    allDay: Boolean,
});

export const EventModel = mongoose.model('Event', EventSchema);
