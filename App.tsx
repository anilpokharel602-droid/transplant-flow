import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Users, Activity, ClipboardList, FileText, Code, Home } from 'lucide-react';

// Pages
import DashboardPage from './pages/DashboardPage';
import PatientsListPage from './pages/PatientsListPage';
import PatientDetailPage from './pages/PatientDetailPage';
import RegisterPatientPage from './pages/RegisterPatientPage';
import PairsListPage from './pages/PairsListPage';
import PairDetailPage from './pages/PairDetailPage';

const SidebarItem = ({ to, icon, label, active }: any) => (
  <Link to={to} className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'}`}>
    <span className="mr-3">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <AppContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </Router>
  );
};

const AppContent: React.FC<{sidebarOpen: boolean, setSidebarOpen: (v: boolean) => void}> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const isMobile = window.innerWidth < 1024;

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="text-xl font-bold text-primary-600 flex items-center">
            <Activity className="mr-2" /> TransplantFlow
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
            <X />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          <SidebarItem to="/" icon={<Home size={20}/>} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/patients" icon={<Users size={20}/>} label="Patients" active={location.pathname.startsWith('/patients')} />
          <SidebarItem to="/pairs" icon={<ClipboardList size={20}/>} label="Pairs" active={location.pathname.startsWith('/pairs')} />
          <SidebarItem to="/register" icon={<FileText size={20}/>} label="Register Patient" active={location.pathname === '/register'} />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden h-16 flex items-center px-4 justify-between">
             <div className="text-lg font-bold text-primary-600">TransplantFlow</div>
             <button onClick={() => setSidebarOpen(true)} className="text-slate-600 p-2">
                <Menu />
             </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/patients" element={<PatientsListPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/register" element={<RegisterPatientPage />} />
              <Route path="/pairs" element={<PairsListPage />} />
              <Route path="/pairs/:id" element={<PairDetailPage />} />
            </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
