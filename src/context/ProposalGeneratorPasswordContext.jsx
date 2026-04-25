import React, { createContext, useContext, useState, useEffect } from 'react';

const ProposalGeneratorPasswordContext = createContext();

export const useProposalAuth = () => {
  const context = useContext(ProposalGeneratorPasswordContext);
  if (!context) {
    throw new Error('useProposalAuth must be used within a ProposalGeneratorPasswordProvider');
  }
  return context;
};

export const ProposalGeneratorPasswordProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session storage for temporary session
    const storedAuth = sessionStorage.getItem('proposal_auth_session');
    
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const authenticate = (password) => {
    return new Promise((resolve) => {
      // Simulate validation delay
      setTimeout(() => {
        if (password === "Elan1990@1025^") {
          setIsAuthenticated(true);
          sessionStorage.setItem('proposal_auth_session', 'true');
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('proposal_auth_session');
  };

  return (
    <ProposalGeneratorPasswordContext.Provider value={{ isAuthenticated, isLoading, authenticate, logout }}>
      {children}
    </ProposalGeneratorPasswordContext.Provider>
  );
};