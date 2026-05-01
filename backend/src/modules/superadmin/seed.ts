import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../auth/user.model';
import { UserRole } from '../../types';

const seedSuperAdmin = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB...');

    const existing = await User.findOne({ role: UserRole.SUPER_ADMIN });
    if (existing) {
      console.log('Super admin already exists:', existing.email);
      process.exit(0);
    }

    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@nexfordedu.com',
      password: 'SuperAdmin@123',
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    console.log('');
    console.log('✅ Super Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email    :', superAdmin.email);
    console.log('Password : SuperAdmin@123');
    console.log('Role     :', superAdmin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
