// This file is deprecated as global password protection has been removed.
// Keeping file to prevent import errors during transition, but it exports nothing useful.
export const GlobalPasswordContext = {};
export const GlobalPasswordProvider = ({ children }) => children;
export const useGlobalPassword = () => ({ isAuthenticated: true });