import React, { createContext, useContext, useState, type ReactNode } from 'react';

type PersonaType = 'firstTimeVoter' | 'seasonedVoter' | 'nriVoter' | 'candidate' | null;

interface UserContextType {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<PersonaType>(null);

  return (
    <UserContext.Provider value={{ persona, setPersona }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
