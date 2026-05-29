/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Loading from './pages/analyze/Loading';
import WorkspaceLayout from './pages/workspace/Layout';
import Overview from './pages/workspace/Overview';
import Architecture from './pages/workspace/Architecture';
import Learn from './pages/workspace/Learn';
import Business from './pages/workspace/Business';
import Report from './pages/workspace/Report';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/analyze/loading" element={<Loading />} />

        <Route path="/workspace/:id" element={<WorkspaceLayout />}>
          <Route index element={<Overview />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="learn" element={<Learn />} />
          <Route path="business" element={<Business />} />
          <Route path="report" element={<Report />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
