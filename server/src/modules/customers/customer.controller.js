import { Customer } from './customer.model.js';
import { AppError } from '../../utils/errors.js';

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Customer can only view their own record
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ _id: id, userId: req.user._id });
      if (!customer) {
        const otherExists = await Customer.findById(id);
        if (otherExists) {
          throw new AppError(
            'Access denied: You can only access your own customer profile.',
            403,
            'FORBIDDEN'
          );
        }
        throw new AppError('Customer not found.', 404, 'NOT_FOUND');
      }

      return res.status(200).json({
        success: true,
        data: { customer },
        message: 'Customer profile retrieved',
      });
    }

    // Admin & Staff can view any customer
    const customer = await Customer.findById(id);
    if (!customer) {
      throw new AppError('Customer not found.', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: { customer },
      message: 'Customer retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Customer can only update their own record and only non-privileged fields
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ _id: id, userId: req.user._id });
      if (!customer) {
        throw new AppError(
          'Access denied: You can only update your own customer profile.',
          403,
          'FORBIDDEN'
        );
      }

      const { name, companyName, phone, billingAddress } = req.body;
      if (name) customer.name = name.trim();
      if (companyName !== undefined) customer.companyName = companyName.trim();
      if (phone !== undefined) customer.phone = phone.trim();
      if (billingAddress) {
        customer.billingAddress = {
          ...customer.billingAddress.toObject(),
          ...billingAddress,
        };
      }

      await customer.save();

      return res.status(200).json({
        success: true,
        data: { customer },
        message: 'Profile updated successfully',
      });
    }

    // Admin & Staff update
    const customer = await Customer.findById(id);
    if (!customer) {
      throw new AppError('Customer not found.', 404, 'NOT_FOUND');
    }

    const { name, companyName, email, phone, billingAddress, taxId, isArchived } = req.body;
    if (name) customer.name = name.trim();
    if (companyName !== undefined) customer.companyName = companyName.trim();
    if (email) customer.email = email.trim().toLowerCase();
    if (phone !== undefined) customer.phone = phone.trim();
    if (billingAddress) customer.billingAddress = billingAddress;
    if (taxId !== undefined) customer.taxId = taxId.trim();
    if (isArchived !== undefined) customer.isArchived = isArchived;

    await customer.save();

    res.status(200).json({
      success: true,
      data: { customer },
      message: 'Customer updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req, res, next) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { isArchived: false };
    if (req.query.search) {
      const term = req.query.search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { companyName: { $regex: term, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Customer.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: 'Customers retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, companyName, email, phone, billingAddress, taxId } = req.body;
    if (!name || !email) {
      throw new AppError('Name and email are required for customer creation.', 400, 'VALIDATION_ERROR');
    }

    const customer = await Customer.create({
      name: name.trim(),
      companyName: companyName?.trim() || '',
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      billingAddress: billingAddress || {},
      taxId: taxId?.trim() || '',
    });

    res.status(201).json({
      success: true,
      data: { customer },
      message: 'Customer created successfully',
    });
  } catch (error) {
    next(error);
  }
};
