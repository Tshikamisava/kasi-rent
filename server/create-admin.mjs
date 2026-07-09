import { sequelize } from './config/mysql.js';
import User from './models/User.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kasirent.com',
      password: 'SecureAdminPass123!',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@kasirent.com');
    console.log('🔑 Password: SecureAdminPass123!');
    console.log('👤 Role: admin');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
})();
