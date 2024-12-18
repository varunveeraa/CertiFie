import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Admin } from '../pages/Admin';
import { Issuer } from '../pages/Issuer';
import { Verify } from '../pages/Verify';
import { NotFound } from '../pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/issuer" element={<Issuer />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}