// scripts/create-super-admin.js

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPER_ADMIN = {
  email: 'admin@talkify.com',
  username: 'admin',
  password: 'admin123456',
};

async function createSuperAdmin() {
  try {
    const usersPath = path.join(__dirname, '../data/users.json');

    let users = [];
    try {
      const data = await fs.readFile(usersPath, 'utf-8');
      users = JSON.parse(data);
    } catch {
      users = [];
    }

    const existingAdmin = users.find((u) => u.email === SUPER_ADMIN.email);
    if (existingAdmin) {
      console.log('❌ Super admin already exists!');
      console.log('📧 Email:', SUPER_ADMIN.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(SUPER_ADMIN.password, 12);

    const superAdmin = {
      id: uuidv4(),
      username: SUPER_ADMIN.username,
      email: SUPER_ADMIN.email,
      password: hashedPassword,
      avatar: null,
      isOnline: false,
      lastSeen: new Date().toISOString(),
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'system',
      role: 'super_admin',
      createdAt: new Date().toISOString(),
    };

    users.push(superAdmin);
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

    console.log('✅ Super admin created!');
    console.log('📧 Email:', SUPER_ADMIN.email);
    console.log('🔑 Password:', SUPER_ADMIN.password);
    console.log('');
    console.log('⚠️  Make sure to change the password!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSuperAdmin();
