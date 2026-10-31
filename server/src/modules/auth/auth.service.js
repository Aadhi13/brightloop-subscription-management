import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { User } from '../users/user.model.js';
import { Customer } from '../customers/customer.model.js';
import { signToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/errors.js';
import { env } from '../../config/env.js';

export const registerCustomer = async ({
  email,
  password,
  name,
  companyName,
  phone,
  billingAddress,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check for duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError(
      'An account with this email address already exists.',
      409,
      'DUPLICATE_EMAIL'
    );
  }

  // Hash password
  const passwordHash = await bcryptjs.hash(password, 12);

  // Create User document - role is always forced to customer
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role: 'customer',
    isActive: true,
    emailVerified: false,
  });

  // Create associated Customer profile
  const customer = await Customer.create({
    userId: user._id,
    name: name.trim(),
    companyName: companyName?.trim() || '',
    email: normalizedEmail,
    phone: phone?.trim() || '',
    billingAddress: billingAddress || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  // Sign JWT
  const token = signToken({ id: user._id, role: user.role });

  return {
    user,
    customer,
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Retrieve user with passwordHash
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // Reject inactive accounts
  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Please contact an administrator.',
      403,
      'ACCOUNT_DEACTIVATED'
    );
  }

  // Load customer document if role is customer
  let customer = null;
  if (user.role === 'customer') {
    customer = await Customer.findOne({ userId: user._id });
  }

  const token = signToken({ id: user._id, role: user.role });

  return {
    user,
    customer,
    token,
  };
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail, isActive: true });

  let rawToken = null;

  if (user) {
    // Generate cryptographically random reset token
    rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Token expires in 15 minutes
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      console.log(`[Password Reset Dev Notice] Token for ${normalizedEmail}: ${rawToken}`);
    }
  }

  // Always return success without revealing whether email exists
  return {
    rawToken: env.NODE_ENV === 'development' || env.NODE_ENV === 'test' ? rawToken : undefined,
  };
};

export const resetPasswordWithToken = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError(
      'Password reset token is invalid or has expired.',
      400,
      'INVALID_RESET_TOKEN'
    );
  }

  // Hash new password and clear reset token fields (single-use)
  user.passwordHash = await bcryptjs.hash(newPassword, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return true;
};
