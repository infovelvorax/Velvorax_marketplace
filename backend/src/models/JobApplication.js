import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  experienceYears: { type: String, default: '' },
  currentCompany: { type: String, default: '' },
  status: {
    type: String,
    enum: ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'],
    default: 'APPLIED'
  },
  employerNotes: { type: String, default: '' }
}, { timestamps: true });

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
