import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { z } from 'zod';

const createAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['admin', 'super_admin']).default('admin'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate request body
    const validation = createAdminSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid validation fields', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, role, status } = validation.data;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists.' },
        { status: 400 }
      );
    }

    // Create user (User model's pre-save middleware will automatically hash the password)
    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create Admin API error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
