import mongoose from 'mongoose';

const questionOptionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true
  },
  optionOrder: {
    type: Number,
    default: 0
  }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  responseType: {
    type: String,
    enum: ['text', 'numeric', 'mcq', 'msq', 'boolean'],
    required: true
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  questionOrder: {
    type: Number,
    default: 0
  },
  options: [questionOptionSchema]
}, { _id: true });

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
templateSchema.index({ isActive: 1, createdAt: -1 });
templateSchema.index({ createdBy: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template; 