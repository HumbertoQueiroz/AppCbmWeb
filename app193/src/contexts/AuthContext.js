import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // restaura sessão do localStorage se existir
    try {
      const raw = localStorage.getItem('authUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        // compatibilidade: se só existir username, trate como email também
        if (parsed && parsed.username && !parsed.email) {
          parsed.email = parsed.username;
        }
        setUser(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const login = async (username, password) => {
    // Implementação simples: aceita qualquer usuário com username não vazio.
    // Substitua por chamada real de API conforme necessário.
    if (!username || !password) {
      throw new Error('Usuário e senha são obrigatórios');
    }

    const userObj = { username, email: username };
    setUser(userObj);
    try {
      localStorage.setItem('authUser', JSON.stringify(userObj));
    } catch (e) {
      // ignore
    }
    return userObj;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('authUser');
    } catch (e) {
      // ignore
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return ctx;
};

export default AuthContext;
