import bcryptjs from 'bcryptjs';
import { User } from './user.model.js';
import { AppError } from '../../utils/errors.js';

export const createStaffUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError(
      'A user with this email address already exists.',
      409,
      'DUPLICATE_EMAIL'
    );
  }

  const passwordHash = await bcryptjs.hash(password, 12);

  const staffUser = await User.create({
    email: normalizedEmail,
    passwordHash,
    role: 'staff',
    isActive: true,
    emailVerified: true,
  });

  return staffUser;
};

export const listUsers = async ({ page = 1, limit = 20, search, role, isActive }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === 'true' || isActive === true;
  }

  if (search) {
    query.email = { $regex: search.trim().toLowerCase(), $options: 'i' };
  }

  const [items, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const updateUserStatus = async (targetUserId, isActive, requestingAdminId) => {
  if (targetUserId.toString() === requestingAdminId.toString() && !isActive) {
    throw new AppError(
      'Administrators cannot deactivate their own account.',
      400,
      'SELF_DEACTIVATION_PROHIBITED'
    );
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }

  user.isActive = isActive;
  await user.save();

  return user;
};
