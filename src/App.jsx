import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { usePeriods } from './hooks/usePeriods';
import Layout from './components/layout/Layout';
import Auth from './components/auth/Auth';
import Dashboard from './components/dashboard/Dashboard';
import PeriodHistory from './components/dashboard/PeriodHistory';
import CreatePeriod from './components/dashboard/CreatePeriod';
import AdminPanel from './components/admin/AdminPanel';
import CalculatorTool from './components/dashboard/CalculatorTool';
import VacationModule from './components/dashboard/VacationModule';
import DocumentModule from './components/dashboard/DocumentModule';
import SecurityModule from './components/dashboard/SecurityModule';
import { SupportView } from './components/dashboard/SupportModule';
import { LayoutDashboard, History, Shield, Calculator, Clock, CheckCircle2, Calendar, Palmtree, FileText, LifeBuoy, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('hours'); // 'hours', 'vacations', 'documents', 'support', 'admin'
  const [subTab, setSubTab] = useState('dashboard'); // 'dashboard', 'calculator', 'history'
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);

  if (!user) {
    return <Auth />;
  }

  const isAdmin = user.role === 'admin';

  const renderContent = () => {
    if (activeTab === 'vacations') return <VacationModule userId={user.id} />;
    if (activeTab === 'documents') return <DocumentModule userId={user.id} />;
    if (activeTab === 'support') return <SupportView />;
    if (activeTab === 'security') return <SecurityModule />;
    if (activeTab === 'admin' && isAdmin) return <AdminPanel />;

    if (activeTab === 'hours') {
      return (
        <div className="space-y-6">
          {/* Sub-tabs internos de Control de Horas */}
          <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl mb-8 w-fit border border-slate-200/50 shadow-sm">
            <button
              onClick={() => setSubTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${subTab === 'dashboard' ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}
            >
              <Clock className="w-3.5 h-3.5" />
              Tablero
            </button>
            <button
              onClick={() => setSubTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${subTab === 'calculator' ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculadora
            </button>
            <button
              onClick={() => setSubTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${subTab === 'history' ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}
            >
              <History className="w-3.5 h-3.5" />
              Historial
            </button>
          </div>

          {subTab === 'calculator' ? (
            <div className="max-w-4xl mx-auto py-4">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Calculadora de Horas</h2>
                <p className="text-slate-500">Proyecta tu cronograma de recuperación de forma sencilla.</p>
              </div>
              <CalculatorTool />
            </div>
          ) : subTab === 'history' ? (
            <PeriodHistory
              userId={user.id}
              onCreateNew={() => {
                setSubTab('dashboard');
                setShowCreate(true);
              }}
              onViewPeriod={(id) => {
                setSelectedPeriodId(id);
                setSubTab('dashboard');
              }}
            />
          ) : (
            <Dashboard
              userId={user.id}
              showCreate={showCreate}
              onCreateDone={(newId) => {
                setShowCreate(false);
                if (newId && typeof newId === 'string') {
                  setSelectedPeriodId(newId);
                }
              }}
              viewPeriodId={selectedPeriodId}
              onBackToActive={() => {
                setSelectedPeriodId(null);
                setShowCreate(false);
              }}
              onSelectPeriod={(id) => {
                setSelectedPeriodId(id);
                setShowCreate(false);
              }}
              onStartCreate={() => {
                setSelectedPeriodId(null);
                setShowCreate(true);
              }}
            />
          )}
        </div>
      );
    }

    return null;
  };

  const sidebarContent = (
    <div className="flex flex-col gap-8 py-4">
      {/* Grupo Principal */}
      <div>
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Principal</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => {
              setActiveTab('hours');
              setSubTab('dashboard');
              setShowCreate(false);
              setSelectedPeriodId(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'hours'
              ? 'bg-primary-50 text-primary-700 shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeTab === 'hours' ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Clock className="w-4 h-4" />
            </div>
            Control de Horas
          </button>

          {(user.features?.vacations || isAdmin) && (
            <button
              onClick={() => { setActiveTab('vacations'); setShowCreate(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'vacations'
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
            >
              <div className={`p-2 rounded-xl transition-all ${activeTab === 'vacations' ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Palmtree className="w-4 h-4" />
              </div>
              Vacaciones
            </button>
          )}

          {(user.features?.documents || isAdmin) && (
            <button
              onClick={() => { setActiveTab('documents'); setShowCreate(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'documents'
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
            >
              <div className={`p-2 rounded-xl transition-all ${activeTab === 'documents' ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FileText className="w-4 h-4" />
              </div>
              Boletas
            </button>
          )}
        </div>
      </div>

      {/* Grupo Sistema */}
      <div>
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sistema</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => { setActiveTab('support'); setShowCreate(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'support'
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeTab === 'support' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <LifeBuoy className="w-4 h-4" />
            </div>
            Soporte
          </button>

          <button
            onClick={() => { setActiveTab('security'); setShowCreate(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'security'
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeTab === 'security' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            Privacidad
          </button>

          {isAdmin && (
            <button
              onClick={() => { setActiveTab('admin'); setShowCreate(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'admin'
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
            >
              <div className={`p-2 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Shield className="w-4 h-4" />
              </div>
              Administración
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout sidebar={sidebarContent}>
      {renderContent()}
    </Layout >
  );
}

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
