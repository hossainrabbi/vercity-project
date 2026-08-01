import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
    console.log('✓ Loaded environment variables from .env.local');
  }
} catch (err) {
  console.error('Error loading .env.local:', err);
}

// We dynamically import mongoose and models to ensure they load after env variables
async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment or .env.local');
    }
    console.log('Connecting to database:', uri);
    await mongoose.connect(uri, {
      bufferCommands: false,
    });
    console.log('✓ Connected to database successfully.');

    const { default: User } = await import('../models/User');

    // 1. Search for existing admin user by email
    let admin = await User.findOne({ email: 'admin@school.com' });
    
    if (admin) {
      console.log('Found existing admin user by email:', admin.email);
      admin.password = 'Admin123';
      admin.role = 'super_admin'; // Ensure role is super_admin
      admin.status = 'active';
      await admin.save();
      console.log('✓ Successfully updated password for admin@school.com');
    } else {
      // 2. If not found by email, search by role
      admin = await User.findOne({ role: 'super_admin' });
      if (!admin) {
        admin = await User.findOne({ role: 'admin' });
      }

      if (admin) {
        console.log(`Found admin user by role (${admin.role}) with email: ${admin.email}`);
        console.log('Updating email to admin@school.com and password to Admin123...');
        admin.email = 'admin@school.com';
        admin.password = 'Admin123';
        admin.status = 'active';
        await admin.save();
        console.log('✓ Successfully updated existing admin user credentials.');
      } else {
        // 3. If no admin user at all, create a new one
        console.log('No existing admin user found. Creating a new admin user...');
        admin = await User.create({
          name: 'Super Admin',
          email: 'admin@school.com',
          password: 'Admin123',
          role: 'super_admin',
          status: 'active',
        });
        console.log('✓ Successfully created new admin@school.com user.');
      }
    }
  } catch (error) {
    console.error('✗ Error updating admin credentials:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

run();
