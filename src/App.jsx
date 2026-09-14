import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AP from './pages/AP';
import Risk from './pages/Risk';
import Governance from './pages/Governance';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ap" element={<AP />} />
          <Route path="risk" element={<Risk />} />
          <Route path="governance" element={<Governance />} />
          {/* Placeholders for un-implemented tabs */}
          <Route path="cash" element={<Placeholder />} />
          <Route path="recon" element={<Placeholder />} />
          <Route path="req" element={<Placeholder />} />
          <Route path="sourcing" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
