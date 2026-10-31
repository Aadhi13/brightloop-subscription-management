import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validator.js';
import * as authService from './auth.service.js';
import { getAuthCookieOptions } from '../../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { user, customer, token } = await authService.registerCustomer(validatedData);

    // Set secure HttpOnly cookie
    res.cookie('token', token, getAuthCookieOptions());

    res.status(201).json({
      success: true,
      data: {
        user,
        customer,
      },
      message: 'Account registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { user, customer, token } = await authService.loginUser(validatedData);

    // Set secure HttpOnly cookie
    res.cookie('token', token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      data: {
        user,
        customer,
      },
      message: 'Logged in successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  const cookieOptions = getAuthCookieOptions();
  res.clearCookie('token', {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      customer: req.customer || null,
    },
    message: 'Current user retrieved',
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      data: result.rawToken ? { devToken: result.rawToken } : {},
      message: 'If an account with that email exists, password reset instructions have been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    await authService.resetPasswordWithToken(validatedData);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
