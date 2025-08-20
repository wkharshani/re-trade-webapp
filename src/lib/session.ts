export interface UserSession {
  userId: string;
  email: string;
  name: string;
  userType: 'seller' | 'buyer';
  isAuthenticated: boolean;
}

export function createSession(user: {
  id: string;
  email: string;
  name: string;
  userType: 'seller' | 'buyer';
}): UserSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    isAuthenticated: true,
  };
}

export function validateSession(session: UserSession | null): boolean {
  return session?.isAuthenticated === true && 
         !!session?.userId && 
         !!session?.email && 
         !!session?.userType;
}

export function hasRoleAccess(session: UserSession | null, requiredRole: 'seller' | 'buyer'): boolean {
  return validateSession(session) && session!.userType === requiredRole;
}

export function getRedirectPath(userType: 'seller' | 'buyer'): string {
  return userType === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
}
