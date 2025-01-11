"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, getIdToken } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
      if (user) {
        // When user signs in, get the ID token and create a session cookie
        const idToken = await getIdToken(user);
        
        // Send the ID token to your backend to create a session cookie
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });
      }
      
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);