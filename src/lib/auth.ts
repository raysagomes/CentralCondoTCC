import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Erro na comparação de senha:', error);
    return false;
  }
};

export const generateToken = (userId: string, modules?: string[]): string => {
  return jwt.sign({ userId, modules }, JWT_SECRET, { expiresIn: '1h' });
};

export const generateUserCookie = (user: any, modules: string[]): string => {
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    accountType: user.accountType,
    enterpriseId: user.enterpriseId,
    modules
  };
  return Buffer.from(JSON.stringify(userData)).toString('base64');
};

export const getUserFromCookie = (): any | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('user_data='));
    if (!cookie) return null;
    
    const value = cookie.split('=')[1];
    const userData = JSON.parse(atob(value));
    return userData;
  } catch {
    return null;
  }
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};