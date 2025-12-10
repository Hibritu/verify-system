const { query } = require('../db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const name = process.env.ADMIN_NAME || 'Admin User';

    const exists = await query('SELECT 1 FROM users WHERE email=$1', [email]);
    const hashed = await bcrypt.hash(password, 10);

    if (exists.rowCount) {
      await query(
        `UPDATE users SET name=$1, password=$2, role='admin', is_approved=true WHERE email=$3`,
        [name, hashed, email]
      );
      console.log('Admin user already exists, password (and name) updated');
      process.exit(0);
    }

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
