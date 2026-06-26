import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Technician } from '../types';

interface TechAuthContextType {
  technician: Technician | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, tech: Technician) => Promise<void>;
  signOut: () => Promise<void>;
  updateTechnician: (data: Partial<Technician>) => void;
}

const TechAuthContext = createContext<TechAuthContextType>({
  technician: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateTechnician: () => {},
});

export const TechAuthProvider = ({ children }: { children: ReactNode }) => {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('tech_auth_token');
        const savedTech = await AsyncStorage.getItem('tech_auth_user');
        if (savedToken && savedTech) {
          setToken(savedToken);
          setTechnician(JSON.parse(savedTech));
        }
      } catch (e) {
        console.error('Tech session restore failed:', e);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const signIn = async (newToken: string, newTech: Technician) => {
    await AsyncStorage.setItem('tech_auth_token', newToken);
    await AsyncStorage.setItem('tech_auth_user', JSON.stringify(newTech));
    setToken(newToken);
    setTechnician(newTech);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('tech_auth_token');
    await AsyncStorage.removeItem('tech_auth_user');
    setToken(null);
    setTechnician(null);
  };

  const updateTechnician = (data: Partial<Technician>) => {
    setTechnician((prev) => prev ? { ...prev, ...data } : null);
  };

  return (
    <TechAuthContext.Provider value={{ technician, token, isLoading, signIn, signOut, updateTechnician }}>
      {children}
    </TechAuthContext.Provider>
  );
};

export const useTechAuth = () => useContext(TechAuthContext);
