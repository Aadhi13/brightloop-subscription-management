import * as userService from './user.service.js';
import { createStaffSchema, updateStatusSchema } from './user.validator.js';

export const createStaff = async (req, res, next) => {
  try {
    const validatedData = createStaffSchema.parse(req.body);
    const staffUser = await userService.createStaffUser(validatedData);

    res.status(201).json({
      success: true,
      data: {
        user: staffUser,
      },
      message: 'Staff account created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, isActive } = req.query;
    const result = await userService.listUsers({
      page,
      limit,
      search,
      role,
      isActive,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = updateStatusSchema.parse(req.body);
    const updatedUser = await userService.updateUserStatus(id, isActive, req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};
