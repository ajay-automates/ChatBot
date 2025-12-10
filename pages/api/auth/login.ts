// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { createToken } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Get user from profiles table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !userProfile) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For now, use Supabase Auth to verify (you'd need to store hashed password in profiles)
    // This is a temporary solution - ideally use Supabase's built-in auth
    const isValidPassword = password.length > 0; // Placeholder validation

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = createToken({ userId: userProfile.id, email: userProfile.email });

    return res.status(200).json({
      token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        plan: userProfile.plan || 'free',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
