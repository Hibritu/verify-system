const { query } = require('../db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123';
    const name = process.env.ADMIN_NAME || 'Admin User';

    const exists = await query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (exists.rowCount) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users(name,email,password,role,is_approved) VALUES($1,$2,$3,'admin',true)`,
      [name, email, hashed]
    );

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the seeder
createAdminUser();
