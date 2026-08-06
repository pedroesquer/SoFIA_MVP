import React, { useEffect, useState } from 'react';
import { User, MortgageFile, BankRate, SimulatedOffer } from './types';
import { INITIAL_BANK_RATES } from './mockData';
import { supabase } from './lib/supabase';
import sofiaMark from './assets/brand/sofia-mark-transparent.png';
import sofiaHorizontalLogo from './assets/brand/sofia-horizontal-transparent.png';

// Modular Components
import Dashboard from './components/Dashboard';
import SofiaChat from './components/SofiaChat';
import FinancialLibrary from './components/FinancialLibrary';
import ProfileAnalyzer from './components/ProfileAnalyzer';
import Simulator from './components/Simulator';
import CrmFiles from './components/CrmFiles';
import KanbanBoard from './components/KanbanBoard';
import RateAdmin from './components/RateAdmin';
import CenterAdmin from './components/CenterAdmin';
import GuidedFlow from './components/GuidedFlow';
import { listarExpedientes, crearExpediente } from './lib/expedientes';

// Icons
import {
  Sparkles,
  BookOpen,
  LayoutDashboard,
  Folder,
  TrendingUp,
  Zap,
  Award,
  Lock,
  User as UserIcon,
  LogOut,
  Sliders,
  Users,
  ShieldCheck,
  MapPin,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Core App State
  const [files, setFiles] = useState<MortgageFile[]>([]);
  const [rates, setRates] = useState<BankRate[]>(INITIAL_BANK_RATES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'kanban' | 'guided' | 'chat' | 'library' | 'rates' | 'center'>('dashboard');
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [guidedFlowFileId, setGuidedFlowFileId] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId);


  const loadUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, name, role, sede')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error cargando perfil:', error);

      await supabase.auth.signOut();
      setCurrentUser(null);

      throw new Error(
        'Tu cuenta existe, pero no tiene un perfil operativo válido.',
      );
    }

    const loadedUser: User = {
      id: userId,
      email: profile.email,
      name: profile.name,
      role: profile.role as User['role'],
      sede: profile.sede,
    };



    try {
      const expedientes = await listarExpedientes(
        loadedUser.email,
        loadedUser.sede,
      );

      setCurrentUser(loadedUser);
      setFiles(expedientes);
      setActiveFileId(expedientes[0]?.id ?? null);
    } catch (error) {
      console.error('Error cargando expedientes:', error);

      setCurrentUser(null);
      setFiles([]);
      setActiveFileId(null);

      throw new Error(
        'Tu sesión inició correctamente, pero no fue posible cargar los expedientes.',
      );
    }
  };
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user && mounted) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error restaurando sesión:', error);

        if (mounted) {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setCurrentUser(null);
        setFiles([]);
        setActiveFileId(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  // Authentication logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoginError('');
    setLoginLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setLoginError('Por favor, llena todos los campos corporativos.');
      setLoginLoading(false);
      return;
    }

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (error) {
        console.error('Error de Supabase Auth:', error);
        setLoginError('Correo o contraseña incorrectos.');
        return;
      }

      if (!data.user) {
        setLoginError('No fue posible obtener los datos del usuario.');
        return;
      }

      await loadUserProfile(data.user.id);
      setPassword('');
    } catch (error) {
      console.error('Error iniciando sesión:', error);

      setLoginError(
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar sesión.',
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error cerrando sesión:', error);
      return;
    }

    setCurrentUser(null);
    setFiles([]);
    setActiveFileId(null);
    setEmail('');
    setPassword('');
    setLoginError('');
  };

  // State modification handlers
  const handleAddFile = async (
    newFile: Omit<MortgageFile, 'id'>,
  ): Promise<MortgageFile> => {
    try {
      const createdFile = await crearExpediente(newFile);

      setFiles((prev) => [createdFile, ...prev]);
      setActiveFileId(createdFile.id);

      return createdFile;
    } catch (error) {
      console.error('Error creando expediente:', error);

      throw new Error(
        'No fue posible registrar el expediente.',
      );
    }
  };

  const handleUpdateFile = (fileId: string, updatedFields: Partial<MortgageFile>) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, ...updatedFields } as MortgageFile : f));
  };

  const handleAddRate = (newRate: BankRate) => {
    setRates(prev => [newRate, ...prev]);
  };

  const handleUpdateRate = (rateId: string, updatedFields: Partial<BankRate>) => {
    setRates(prev => prev.map(r => r.id === rateId ? { ...r, ...updatedFields } as BankRate : r));
  };

  // Start guided flow for specific client
  const handleStartGuidedFlow = (fileId: string) => {
    setGuidedFlowFileId(fileId);
    setActiveTab('guided');
  };

  // Login Screen Render
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-1.5 shadow-lg shadow-emerald-500/20">
            <img src={sofiaMark} alt="" className="h-full w-full object-contain" />
            <span className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-emerald-400 animate-spin" />
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verificando sesión
          </p>
        </div>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 flex flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 font-sans" id="login-layout">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-slate-100 lg:block">
          <img src={sofiaMark} alt="" className="h-full w-full object-contain p-20 xl:p-28" />
          <div className="absolute inset-x-10 bottom-10 rounded-xl border border-emerald-100 bg-white/80 p-5 text-slate-800 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Inteligencia hipotecaria</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">Análisis, estructuración y seguimiento comercial desde una sola mesa operativa.</p>
          </div>
        </div>

        <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md lg:mx-0 lg:ml-[7vw] text-center space-y-4">
          <div className="mx-auto h-24 w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-emerald-900/10">
            <img src={sofiaHorizontalLogo} alt="SoFIA" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">SoFIA Operativa</h1>
            <p className="text-xs font-bold text-emerald-700 tracking-widest uppercase mt-1">Copiloto de Crédito & CRM Hipotecario</p>
            <p className="text-xs text-slate-400 mt-2">Mesa de Control y Fuerza de Ventas CREDIDIEZ</p>
          </div>
        </div>

        <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md lg:mx-0 lg:ml-[7vw]">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-150 rounded-xl sm:px-10 space-y-6">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 text-center flex items-center justify-center gap-1.5">
              <Lock className="h-4 w-4 text-slate-400" />
              Autenticación de Acceso Corporativo
            </h3>

            <form className="space-y-4.5" onSubmit={handleLogin}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Correo Institucional</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@credidiez.mx"
                  className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded px-3 py-2.5 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña Corporativa</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded px-3 py-2.5 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              {loginError && (
                <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-150 font-bold text-center leading-normal">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs tracking-wider uppercase shadow-sm cursor-pointer transition-all duration-150"
              >
                {loginLoading ? 'Verficando ...' : 'Iniciar Sesión'}
              </button>
            </form>


          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50/60 flex text-slate-800 font-sans leading-relaxed text-sm antialiased" id="main-panel-layout">

      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0 lg:shadow-none ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`} id="sidebar">
        <div>
          {/* Logo Brand */}
          <div className="p-4 lg:p-5 border-b border-slate-100 flex items-center gap-2.5 mb-2">
            <div className="h-16 min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
              <img src={sofiaHorizontalLogo} alt="SoFIA Operativa" className="h-full w-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menú Principal */}
          <nav className="p-4 space-y-1">
            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2.5">Navegación</span>

            {[
              { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
              { id: 'crm', label: 'Expedientes CRM', icon: Folder },
              { id: 'kanban', label: 'Tablero Kanban', icon: TrendingUp },
              { id: 'guided', label: 'Estructurador Guiado', icon: Zap },
              { id: 'chat', label: 'Chat SoFIA (AI)', icon: Sparkles },
              { id: 'library', label: 'Biblioteca Financiera', icon: BookOpen },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    if (item.id !== 'guided') setGuidedFlowFileId(null);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${isActive
                    ? 'text-emerald-600 bg-emerald-50 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Administrador de Tasas / Políticas (Admin & Superadmin only) */}
            {['Superadministrador', 'Administrador de Centro'].includes(currentUser.role) && (
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">Administración</span>
                <button
                  onClick={() => {
                    setActiveTab('rates');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'rates'
                    ? 'text-emerald-600 bg-emerald-50 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <Sliders className={`h-4.5 w-4.5 ${activeTab === 'rates' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Administrador de Tasas</span>
                </button>
              </div>
            )}

            {/* Administrador de Centro (Superadmin only) */}
            {currentUser.role === 'Superadministrador' && (
              <button
                onClick={() => {
                  setActiveTab('center');
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'center'
                  ? 'text-emerald-600 bg-emerald-50 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
              >
                <Users className={`h-4.5 w-4.5 ${activeTab === 'center' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Administración de Centro</span>
              </button>
            )}
          </nav>
        </div>

        {/* Info Perfil y Salida */}
        <div className="mt-auto p-4 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.split(' ').map(n => n.charAt(0)).join('')}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate mt-1">
                {currentUser.role === 'Administrador de Centro' ? 'Director Sede' : currentUser.role}
              </p>
            </div>
          </div>
          <div className="mt-3 px-1 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase">
            <span>v2.4 - Julio 2026</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 mt-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CORE STAGE */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 lg:min-h-0" id="main-content-stage">

        {/* HEADER BAR */}
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:h-16 lg:px-8 lg:py-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" id="header">
          <div className="flex min-w-0 items-center gap-3 lg:gap-4">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
              {activeTab === 'dashboard' ? 'Dashboard General' :
                activeTab === 'crm' ? 'Expedientes CRM' :
                  activeTab === 'kanban' ? 'Tablero Kanban' :
                    activeTab === 'guided' ? 'Estructurador Guiado' :
                      activeTab === 'chat' ? 'Copiloto SoFIA' :
                        activeTab === 'library' ? 'Biblioteca Financiera' :
                          activeTab === 'rates' ? 'Administrador de Tasas' : 'Administración de Centro'}
            </h1>
            <div className="hidden h-4 w-px bg-slate-200 sm:block"></div>
            <span className="hidden shrink-0 text-xs text-slate-400 font-medium px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full sm:inline-flex">
              {currentUser.sede}
            </span>
          </div>

          {/* Active Client Selector Dropdown status */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <div className="min-w-0 flex-1 text-left sm:text-right">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Expediente Contextual</span>
              <select
                value={activeFileId || ''}
                onChange={(e) => setActiveFileId(e.target.value || null)}
                className="block w-full max-w-full truncate bg-transparent border-none font-bold text-xs text-slate-800 outline-none cursor-pointer pr-1 hover:text-emerald-700 transition-colors sm:max-w-xs"
              >
                <option value="">-- Ninguno Seleccionado --</option>
                {files.map(file => (
                  <option key={file.id} value={file.id}>{file.name} (Folio: {file.id})</option>
                ))}
              </select>
            </div>

            {activeFile && (
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 flex items-center justify-center shadow-sm" title="Caso Activo Listo">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
            )}
          </div>
        </header>

        {/* CORE VIEWS SHELL */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto" id="stage-viewport">
          {activeTab === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              files={files}
              rates={rates}
              onSelectFile={(id) => {
                setActiveFileId(id);
                setActiveTab('crm');
              }}
              onNavigate={(idx) => {
                if (idx === 6) setActiveTab('crm');
                else if (idx === 3) setActiveTab('guided');
              }}
              onStartGuidedFlow={handleStartGuidedFlow}
            />
          )}

          {activeTab === 'crm' && (
            <CrmFiles
              currentUser={currentUser}
              files={files}
              onSelectFile={setActiveFileId}
              onUpdateFile={handleUpdateFile}
              onAddFile={handleAddFile}
              onStartGuidedFlow={handleStartGuidedFlow}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanBoard
              currentUser={currentUser}
              files={files}
              onUpdateFile={handleUpdateFile}
              onSelectFile={(id) => {
                setActiveFileId(id);
                setActiveTab('crm');
              }}
            />
          )}

          {activeTab === 'guided' && (
            <GuidedFlow
              currentUser={currentUser}
              files={files}
              rates={rates}
              initialFileId={guidedFlowFileId}
              onUpdateFile={handleUpdateFile}
              onFinishFlow={() => {
                setGuidedFlowFileId(null);
                setActiveTab('crm');
              }}
            />
          )}

          {activeTab === 'chat' && (
            <SofiaChat
              currentUser={currentUser}
              activeFile={activeFile}
              rates={rates}
            />
          )}

          {activeTab === 'library' && (
            <FinancialLibrary
              currentUser={currentUser}
              rates={rates}
              onNavigateToAdmin={() => setActiveTab('rates')}
            />
          )}

          {activeTab === 'rates' && (
            <RateAdmin
              currentUser={currentUser}
              rates={rates}
              onAddRate={handleAddRate}
              onUpdateRate={handleUpdateRate}
            />
          )}

          {activeTab === 'center' && (
            <CenterAdmin
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

    </div>
  );
}
