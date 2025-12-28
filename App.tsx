import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import SaveTheDate from './SaveTheDate';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/save-the-date" element={<SaveTheDate />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
