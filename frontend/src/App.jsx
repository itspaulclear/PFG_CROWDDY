import React from 'react';
import AppRoutes from './AppRoutes';
import { Toaster } from 'sonner';

const App = () => {
  return (
    <div className="App">
      <AppRoutes />
      <Toaster position="bottom-left" duration={3000} />
    </div>
  );
};

export default App;

