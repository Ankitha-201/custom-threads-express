
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication - in real app, this would call your backend API
      if (email === 'admin@printxpress.com' && password === 'admin123') {
        const adminUser = { id: '1', email, name: 'Admin User', role: 'admin' as const };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast({ title: 'Welcome back, Admin!' });
        return true;
      } else if (email && password) {
        const regularUser = { id: '2', email, name: email.split('@')[0], role: 'user' as const };
        setUser(regularUser);
        localStorage.setItem('user', JSON.stringify(regularUser));
        toast({ title: 'Welcome back!' });
        return true;
      }
      return false;
    } catch (error) {
      toast({ title: 'Login failed', description: 'Please check your credentials', variant: 'destructive' });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Mock registration - in real app, this would call your backend API
      const newUser = { id: Math.random().toString(), email, name, role: 'user' as const };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast({ title: 'Account created successfully!' });
      return true;
    } catch (error) {
      toast({ title: 'Registration failed', variant: 'destructive' });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({ title: 'Logged out successfully' });
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
