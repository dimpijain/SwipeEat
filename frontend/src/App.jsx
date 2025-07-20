import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Register from './pages/Register'
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    
  );
};

export default App;

