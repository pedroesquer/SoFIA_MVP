import React, { useState } from 'react';
import { BankRate, User } from '../types';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  BookOpen, 
  ArrowUpRight, 
  ShieldAlert,
  Download,
  ExternalLink
} from 'lucide-react';

interface FinancialLibraryProps {
  currentUser: User;
  rates: BankRate[];
  onNavigateToAdmin?: () => void;
}

export default function FinancialLibrary({ currentUser, rates, onNavigateToAdmin }: FinancialLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  // Extract unique banks
  const uniqueBanks = ['Todos', ...Array.from(new Set(rates.map(r => r.bankName)))];

  // Filter rates
  const filteredRates = rates.filter(rate => {
    const matchesSearch = 
      rate.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBank = selectedBank === 'Todos' || rate.bankName === selectedBank;
    const matchesStatus = selectedStatus === 'Todos' || rate.status === selectedStatus;

    return matchesSearch && matchesBank && matchesStatus;
  });

  const getStatusBadge = (status: BankRate['status']) => {
    switch (status) {
      case 'Validado internamente':
        return <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">● Validado</span>;
      case 'Actualizado':
        return <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">● Actualizado</span>;
      case 'Requiere revisión':
        return <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">▲ Requiere revisión</span>;
      case 'Desactualizado':
        return <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">✖ Desactualizado</span>;
      default:
        return <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-250 px-2.5 py-0.5 rounded-full flex items-center gap-1">● Pendiente</span>;
    }
  };

  const getTrustLevelBadge = (level: BankRate['trustLevel']) => {
    switch (level) {
      case 'Crítico':
        return <span className="text-[9px] font-semibold bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">Confianza Crítica</span>;
      case 'Alto':
        return <span className="text-[9px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200">Confianza Alta</span>;
      default:
        return <span className="text-[9px] font-semibold bg-slate-150 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">Confianza Media</span>;
    }
  };

  return (
    <div className="space-y-6" id="library-container">
      {/* Top Banner */}
      <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Biblioteca Financiera de CREDIDIEZ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Políticas de riesgo, manuales operativos, tasas oficiales y condiciones de los principales bancos de México.
          </p>
        </div>
        
        {/* Admin rate bypass navigation link if applicable */}
        {['Superadministrador', 'Administrador de Centro'].includes(currentUser.role) && onNavigateToAdmin && (
          <button 
            onClick={onNavigateToAdmin}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 shadow-sm transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Administrar Tasas y Políticas
          </button>
        )}
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por banco, producto, requisitos clave..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium text-slate-800"
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span>Banco:</span>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="bg-transparent border-none font-semibold text-slate-700 outline-none cursor-pointer"
            >
              {uniqueBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span>Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Validado internamente">Validados</option>
              <option value="Actualizado">Actualizados</option>
              <option value="Requiere revisión">Requieren revisión</option>
              <option value="Desactualizado">Desactualizados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster de Tarjetas Bancarias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRates.map((rate) => {
          // Format lastUpdated date in Mexican format
          const dParts = rate.lastUpdated.split('-');
          const mexDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : rate.lastUpdated;

          return (
            <div key={rate.id} className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      {rate.bankName}
                      <span className="text-xs font-normal text-slate-400">· {rate.productName}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Validador: {rate.verifiedBy}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {getStatusBadge(rate.status)}
                    {getTrustLevelBadge(rate.trustLevel)}
                  </div>
                </div>

                {/* Métricas Principales de Tasa */}
                <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-3.5 my-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tasa Ordinaria</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{rate.interestRate.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">CAT Promedio</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{rate.cat.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Comisión Apertura</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {rate.commission > 0 ? `${rate.commission.toFixed(2)}%` : '0.0% (Sin com.)'}
                    </p>
                  </div>
                </div>

                {/* Requisitos y Políticas */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Criterios de Elegibilidad Clave:</h4>
                    <ul className="space-y-1.5">
                      {rate.requirements.map((req, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                          <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fortalezas y Ventajas específicas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <h5 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Ventajas Principales</h5>
                      <ul className="space-y-1">
                        {rate.advantages?.slice(0, 2).map((adv, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 list-disc list-inside truncate">
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Riesgos / Limitaciones</h5>
                      <ul className="space-y-1">
                        {rate.risks?.slice(0, 2).map((risk, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 list-disc list-inside truncate">
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción y sello de fecha */}
              <div className="mt-5 pt-3.5 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-[10px] font-medium text-slate-400">
                  Tasa actualizada al: <strong className="text-slate-600">{mexDate}</strong> · Fuente: <strong className="text-slate-600">{rate.source}</strong> · Validado
                </span>
                <div className="flex gap-2">
                  <button className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" /> Ficha Técnica
                  </button>
                  <button className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> Políticas
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredRates.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
            Ninguna tasa o política bancaria coincide con los filtros establecidos. Prueba modificando tu búsqueda.
          </div>
        )}
      </div>

      {/* Manuales Operativos Internos CREDIDIEZ */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Manuales Operativos y Guías Rápidas CREDIDIEZ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200 hover:border-slate-300 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-3 cursor-pointer">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">Guía de Comprobación Fiscal 2026</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Criterios de validación de CFDI de nómina, estados de cuenta y declaraciones anuales.</p>
              <span className="text-[9px] text-emerald-600 font-semibold mt-2 block">Actualizado v1.8</span>
            </div>
          </div>

          <div className="border border-slate-200 hover:border-slate-300 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-3 cursor-pointer">
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">Políticas de Co-acreditados de Primer Grado</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Lineamientos para sumar ingresos de cónyuge, padres, hermanos e hijos por institución bancaria.</p>
              <span className="text-[9px] text-emerald-600 font-semibold mt-2 block">Actualizado v2.1</span>
            </div>
          </div>

          <div className="border border-slate-200 hover:border-slate-300 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-3 cursor-pointer">
            <div className="p-2 bg-orange-50 text-orange-600 rounded">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">Lineamiento para Consulta Segura de Buró</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Formatos correctos, validez de firmas autógrafas y flujo de autorización digital.</p>
              <span className="text-[9px] text-emerald-600 font-semibold mt-2 block">Actualizado v3.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
