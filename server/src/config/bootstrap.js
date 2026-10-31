import bcryptjs from 'bcryptjs';
import { User } from '../modules/users/user.model.js';

export const bootstrapAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const defaultEmail = process.env.ADMIN_EMAIL || 'admin@brightloop.io';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@12345!';

      const passwordHash = await bcryptjs.hash(defaultPassword, 12);
      await User.create({
        email: defaultEmail.toLowerCase().trim(),
        passwordHash,
        role: 'admin',
        isActive: true,
        emailVerified: true,
      });

      console.log(`[Bootstrap] Initial administrator account created: ${defaultEmail}`);
    }
  } catch (error) {
    console.error(`[Bootstrap] Error ensuring initial admin user: ${error.message}`);
  }
};

export default bootstrapAdmin;
