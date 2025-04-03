import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the types for our actions
export interface ActionBarAction {
  id: string;
  component: React.ReactNode;
}

// Define the context type
interface ActionBarContextType {
  actions: ActionBarAction[];
  setActions: (actions: ActionBarAction[]) => void;
  clearActions: () => void;
}

// Create the context with default values
const ActionBarContext = createContext<ActionBarContextType>({
  actions: [],
  setActions: () => {},
  clearActions: () => {},
});

// Create a provider component
interface ActionBarProviderProps {
  children: ReactNode;
}

export const ActionBarProvider: React.FC<ActionBarProviderProps> = ({ children }) => {
  const [actions, setActions] = useState<ActionBarAction[]>([]);

  const clearActions = () => {
    setActions([]);
  };

  return (
    <ActionBarContext.Provider value={{ actions, setActions, clearActions }}>
      {children}
    </ActionBarContext.Provider>
  );
};

// Create a custom hook for using the context
export const useActionBar = () => useContext(ActionBarContext);
