import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationExpiresAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
