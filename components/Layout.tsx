import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, ClipboardCheck } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6" />
            ConsultantPro
          </h1>
        </div>
        <nav className="p-4 space-y-1">
          <NavLink 
            to="/dashboard"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/quizzes"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <FileText className="w-5 h-5" />
            Quizzes
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};