import React, { createContext, useState, useContext, useEffect } from 'react';

const ProposalGeneratorContext = createContext();

export const useProposalGeneratorAuth = () => {
  const context = useContext(ProposalGeneratorContext);
  if (!context) {
    throw new Error('useProposalGeneratorAuth must be used within a ProposalGeneratorProvider');
  }
  return context;
};

export const ProposalGeneratorProvider = ({ children }) => {
  const [isProposalGeneratorAuthenticated, setProposalGeneratorAuthenticated] = useState(() => {
    // Check session storage on mount to persist state during session
    return sessionStorage.getItem('isProposalGeneratorAuthenticated') === 'true';
  });

  const login = (password) => {
    // Validate exact password match
    if (password === "Elan1990@1025^") {
      setProposalGeneratorAuthenticated(true);
      sessionStorage.setItem('isProposalGeneratorAuthenticated', 'true');
      return true;
    }
    return false;
  };

  return (
    <ProposalGeneratorContext.Provider value={{ isProposalGeneratorAuthenticated, login }}>
      {children}
    </ProposalGeneratorContext.Provider>
  );
};