import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePeriods } from './hooks/usePeriods';
import Layout from './components/layout/Layout';
import Auth from './components/auth/Auth';
import Dashboard from './components/dashboard/Dashboard';
import PeriodHistory from './components/dashboard/PeriodHistory';
import CreatePeriod from './components/dashboard/CreatePeriod';
import AdminPanel from './components/admin/AdminPanel';
import CalculatorTool from './components/dashboard/CalculatorTool';
import { LayoutDashboard, History, Shield, Calculator, Clock, CheckCircle2, Calendar } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreate, setShowCreate] = useState(false);

  if (!user) {
    return <Auth />;
  }

  const isAdmin = user.role === 'admin';

  const renderContent = () => {
    if (activeTab === 'admin' && isAdmin) {
      return <AdminPanel />;
    }

    if (activeTab === 'calculator') {
      return (
        <div className="max-w-4xl mx-auto py-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Calculadora de Horas</h2>
            <p className="text-slate-500">Proyecta tu cronograma de recuperación de forma sencilla.</p>
          </div>
          <CalculatorTool />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Clock className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-bold text-slate-800 mb-2">Planificación Precisa</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Calcula exactamente cuántos días te tomará cubrir tus horas según tu disponibilidad diaria.</p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Calendar className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-bold text-slate-800 mb-2">Excluye fines de semana</h3>
              <p className="text-sm text-slate-500 leading-relaxed">El sistema identifica automáticamente sábados y domingos para darte una fecha real de finalización.</p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-bold text-slate-800 mb-2">Meta Clara</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Tener una fecha objetivo ayuda a mantener el compromiso con la recuperación de tus horas.</p>
            </div>
          </div>
        </div>
      );
    }

    if (showCreate) {
      return (
        <CreatePeriod
          onCreate={(name) => {
            // El Dashboard se encargará de crear el período
            setShowCreate(false);
            setActiveTab('dashboard');
          }}
        />
      );
    }

    if (activeTab === 'history') {
      return (
        <PeriodHistory
          userId={user.id}
          onCreateNew={() => { setShowCreate(true); setActiveTab('dashboard'); }}
        />
      );
    }

    return (
      <div className="space-y-8">
        <Dashboard
          userId={user.id}
          showCreate={showCreate}
          onCreateDone={() => setShowCreate(false)}
        />
      </div>
    );
  };

  return (
    <Layout>
      {/* Nav Tabs */}
      <div className="flex gap-1 bg-white/60 backdrop-blur-sm border border-white/30 p-1.5 rounded-2xl mb-8 w-fit shadow-sm flex-wrap">
        <button
          onClick={() => { setActiveTab('dashboard'); setShowCreate(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard'
            ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20'
            : 'text-slate-600 hover:bg-white/80'
            }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Mi Control
        </button>

        <button
          onClick={() => { setActiveTab('calculator'); setShowCreate(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'calculator'
            ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20'
            : 'text-slate-600 hover:bg-white/80'
            }`}
        >
          <Calculator className="w-4 h-4" />
          Calculadora
        </button>

        <button
          onClick={() => { setActiveTab('history'); setShowCreate(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history'
            ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20'
            : 'text-slate-600 hover:bg-white/80'
            }`}
        >
          <History className="w-4 h-4" />
          Historial
        </button>

        {isAdmin && (
          <button
            onClick={() => { setActiveTab('admin'); setShowCreate(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'admin'
              ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20'
              : 'text-slate-600 hover:bg-white/80'
              }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        )}
      </div>

      {renderContent()}
    </Layout>
  );
}

export default () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);
