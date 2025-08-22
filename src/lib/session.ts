import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller';
  isLoggedIn: boolean;
}

// Temporary session management using Next.js cookies
// TODO: Replace with iron-session when package is available

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('re-trade-session');
  
  if (!sessionCookie?.value) {
    return {
      userId: '',
      email: '',
      name: '',
      role: 'buyer',
      isLoggedIn: false,
    };
  }
  
  try {
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
    return {
      ...sessionData,
      isLoggedIn: true,
    };
  } catch (error) {
    return {
      userId: '',
      email: '',
      name: '',
      role: 'buyer',
      isLoggedIn: false,
    };
  }
}

export async function createSession(userData: Omit<SessionData, 'isLoggedIn'>): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionData = {
    ...userData,
    isLoggedIn: true,
  };
  
  // Set cookie with session data
  cookieStore.set('re-trade-session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  return sessionData;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('re-trade-session');
}

export async function requireAuth(role?: 'buyer' | 'seller'): Promise<SessionData> {
  const session = await getSession();
  
  if (!session.isLoggedIn) {
    redirect('/login');
  }
  
  if (role && session.role !== role) {
    redirect('/');
  }
  
  return session;
}

export async function requireSellerAuth(): Promise<SessionData> {
  return requireAuth('seller');
}

export async function requireBuyerAuth(): Promise<SessionData> {
  return requireAuth('buyer');
}
