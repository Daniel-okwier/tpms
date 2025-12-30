import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        role: {
            type: String,
            enum: ['admin', 'doctor', 'nurse', 'lab_staff', 'pharmacist', 'data_coder'], 
            default: 'doctor',
        },
        // Password reset
        resetPasswordToken: String,
        resetPasswordExpire: Date,

        // Enforce post-onboarding password change
        mustChangePassword: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Hash password if modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare candidate vs hashed
userSchema.methods.matchPassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create reset token (plain for email, hashed persisted)
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // token valid for 1 hour
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    return resetToken;
};

// --- FIX APPLIED HERE ---
// This checks if the model exists before trying to create it again
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;