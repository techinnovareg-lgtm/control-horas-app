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
import SupportModule from './components/dashboard/SupportModule';
import { LayoutDashboard, History, Shield, Calculator, Clock, CheckCircle2, Calendar, Palmtree, FileText, LifeBuoy } from 'lucide-react';

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
    if (activeTab === 'support') return <SupportModule />;
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
            <PeriodHistory />
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

  return (
    <Layout>
      {/* Navegación Principal: Los 3 Paneles Clave + Secundarios */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex gap-1.5 bg-white/60 backdrop-blur-md border border-white/40 p-1.5 rounded-[24px] shadow-sm flex-wrap">
          <button
            id="nav-hours"
            onClick={() => {
              setActiveTab('hours');
              setSubTab('dashboard');
              setShowCreate(false);
              setSelectedPeriodId(null);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-[18px] text-sm font-black transition-all ${activeTab === 'hours'
              ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20 scale-105'
              : 'text-slate-600 hover:bg-white/80'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Control de Horas
          </button>

          {(user.features?.vacations || isAdmin) && (
            <button
              id="nav-vacations"
              onClick={() => { setActiveTab('vacations'); setShowCreate(false); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-[18px] text-sm font-black transition-all ${activeTab === 'vacations'
                ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20 scale-105'
                : 'text-slate-600 hover:bg-white/80'
                }`}
            >
              <Palmtree className="w-4 h-4" />
              Vacaciones
            </button>
          )}

          {(user.features?.documents || isAdmin) && (
            <button
              id="nav-documents"
              onClick={() => { setActiveTab('documents'); setShowCreate(false); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-[18px] text-sm font-black transition-all ${activeTab === 'documents'
                ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20 scale-105'
                : 'text-slate-600 hover:bg-white/80'
                }`}
            >
              <FileText className="w-4 h-4" />
              Boletas
            </button>
          )}
        </div>

        <div className="flex gap-1.5 bg-slate-100/30 p-1.5 rounded-[24px] border border-slate-200/30 flex-wrap">
          <button
            id="nav-support"
            onClick={() => { setActiveTab('support'); setShowCreate(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-xs font-bold transition-all ${activeTab === 'support'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-white/80'
              }`}
          >
            <LifeBuoy className="w-4 h-4" />
            Soporte
          </button>

          {isAdmin && (
            <button
              id="nav-admin"
              onClick={() => { setActiveTab('admin'); setShowCreate(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-xs font-bold transition-all ${activeTab === 'admin'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-500 hover:bg-white/80'
                }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          )}
        </div>
      </div>

      {renderContent()}
    </Layout >
  );
}

export default () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);
