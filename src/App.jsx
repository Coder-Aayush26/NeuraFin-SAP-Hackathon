import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AP from './pages/AP';
import Risk from './pages/Risk';
import Governance from './pages/Governance';
import Cash from './pages/Cash';
import Recon from './pages/Recon';
import Req from './pages/Req';
import Sourcing from './pages/Sourcing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ap" element={<AP />} />
          <Route path="risk" element={<Risk />} />
          <Route path="governance" element={<Governance />} />
          <Route path="cash" element={<Cash />} />
          <Route path="recon" element={<Recon />} />
          <Route path="req" element={<Req />} />
          <Route path="sourcing" element={<Sourcing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
