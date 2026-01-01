import React from 'react';
import { Outlet } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center">
             <h1 className="text-lg font-bold text-indigo-700">ConsultantPro Assessment</h1>
        </div>
      </header>
      <main className="flex-1 py-8 px-4">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-gray-400 text-sm">
        Powered by ConsultantPro
      </footer>
    </div>
  );
};