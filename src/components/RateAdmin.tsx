import React, { useState } from 'react';
import { BankRate, User } from '../types';
import { 
  Lock, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  History, 
  AlertTriangle, 
  RefreshCw,
  Save,
  Undo
} from 'lucide-react';

interface RateAdminProps {
  currentUser: User;
  rates: BankRate[];
  onAddRate: (rate: BankRate) => void;
  onUpdateRate: (rateId: string, updatedFields: Partial<BankRate>) => void;
}

export default function RateAdmin({ currentUser, rates, onAddRate, onUpdateRate }: RateAdminProps) {
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  
  // Rate form states
  const [bankName, setBankName] = useState('');
  const [productName, setProductName] = useState('');
  const [interestRate, setInterestRate] = useState(10.5);
  const [cat, setCat] = useState(12.5);
  const [commission, setCommission] = useState(1.5);
  const [status, setStatus] = useState<BankRate['status']>('Actualizado');
  const [trustLevel, setTrustLevel] = useState<BankRate['trustLevel']>('Alto');
  const [requirements, setRequirements] = useState('');
  const [advantages, setAdvantages] = useState('');
  const [risks, setRisks] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Rate change audit log
  const [auditLogs, setAuditLogs] = useState<{ id: string; bank: string; broker: string; change: string; timestamp: string }[]>([
    { id: '1', bank: 'Scotiabank', broker: 'sofia.martinez@credidiez.mx', change: 'Actualizó tasa ordinaria a 9.90% (disminución de 0.20%)', timestamp: '2026-07-09T14:32:00Z' },
    { id: '2', bank: 'BBVA', broker: 'pedro.garza@credidiez.mx', change: 'Creación de producto digital pre-aprobado express.', timestamp: '2026-07-08T09:15:00Z' }
  ]);

  const resetForm = () => {
    setSelectedRateId(null);
    setBankName('');
    setProductName('');
    setInterestRate(10.5);
    setCat(12.5);
    setCommission(1.5);
    setStatus('Actualizado');
    setTrustLevel('Alto');
    setRequirements('');
    setAdvantages('');
    setRisks('');
    setIsEditing(false);
  };

  const handleSelectRateForEdit = (rate: BankRate) => {
    setSelectedRateId(rate.id);
    setBankName(rate.bankName);
    setProductName(rate.productName);
    setInterestRate(rate.interestRate);
    setCat(rate.cat);
    setCommission(rate.commission);
    setStatus(rate.status);
    setTrustLevel(rate.trustLevel);
    setRequirements(rate.requirements.join('\n'));
    setAdvantages((rate.advantages || []).join('\n'));
    setRisks((rate.risks || []).join('\n'));
    setIsEditing(true);
  };

  const handleSaveRate = () => {
    if (!bankName || !productName) {
      alert('Ingresa al menos el nombre del banco y del producto.');
      return;
    }

    const parsedRequirements = requirements.split('\n').filter(r => r.trim() !== '');
    const parsedAdvantages = advantages.split('\n').filter(a => a.trim() !== '');
    const parsedRisks = risks.split('\n').filter(r => r.trim() !== '');

    if (isEditing && selectedRateId) {
      // Find original to log changes
      const original = rates.find(r => r.id === selectedRateId);
      let logMsg = `Actualizó el producto "${productName}"`;
      if (original && original.interestRate !== interestRate) {
        logMsg = `Modificó la tasa de interés de ${original.interestRate}% a ${interestRate}%`;
      }

      onUpdateRate(selectedRateId, {
        bankName,
        productName,
        interestRate,
        cat,
        commission,
        status,
        trustLevel,
        requirements: parsedRequirements,
        advantages: parsedAdvantages,
        risks: parsedRisks,
        lastUpdated: new Date().toISOString().split('T')[0],
        verifiedBy: currentUser.name
      });

      // Add to audit logs
      setAuditLogs(prev => [
        {
          id: `audit-${Date.now()}`,
          bank: bankName,
          broker: currentUser.email,
          change: logMsg,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);

      alert('¡Tasa y política bancaria actualizadas con éxito!');
    } else {
      const newRate: BankRate = {
        id: `rate-${Date.now()}`,
        bankName,
        productName,
        interestRate,
        cat,
        commission,
        appraisalCost: 3.5, // 3.5 al millar standard
        requirements: parsedRequirements,
        advantages: parsedAdvantages,
        risks: parsedRisks,
        status,
        trustLevel,
        lastUpdated: new Date().toISOString().split('T')[0],
        verifiedBy: currentUser.name,
        source: 'Biblioteca interna CREDIDIEZ'
      };

      onAddRate(newRate);

      setAuditLogs(prev => [
        {
          id: `audit-${Date.now()}`,
          bank: bankName,
          broker: currentUser.email,
          change: `Creó nuevo producto financiero: ${productName}`,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);

      alert('¡Nueva política bancaria registrada con éxito!');
    }

    resetForm();
  };

  // Check role restrictions
  if (!['Superadministrador', 'Administrador de Centro'].includes(currentUser.role)) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center max-w-md mx-auto space-y-4">
        <Lock className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-rose-900">Acceso Restringido</h3>
        <p className="text-xs text-rose-700 leading-relaxed">
          Este módulo está reservado únicamente para Directores de Sede, Mesa de Control o Administradores de CREDIDIEZ. Tu perfil actual es <strong>{currentUser.role}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="rate-admin-panel">
      
      {/* Formulario de Administración */}
      <div className="xl:col-span-1 bg-white border border-slate-150 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          {isEditing ? <Edit className="h-4.5 w-4.5 text-emerald-600" /> : <Plus className="h-4.5 w-4.5 text-slate-400" />}
          {isEditing ? 'Editar Producto Bancario' : 'Registrar Nuevo Producto'}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Banco</label>
            <input 
              type="text" 
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ej. Banorte"
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Producto</label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej. Hipoteca Fuerte"
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa (%)</label>
            <input 
              type="number" 
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CAT (%)</label>
            <input 
              type="number" 
              step="0.1"
              value={cat}
              onChange={(e) => setCat(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comisión (%)</label>
            <input 
              type="number" 
              step="0.1"
              value={commission}
              onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Validación Estado</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none cursor-pointer"
            >
              <option value="Validado internamente">Validado internamente</option>
              <option value="Actualizado">Actualizado</option>
              <option value="Requiere revisión">Requiere revisión</option>
              <option value="Desactualizado">Desactualizado</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nivel de Confianza</label>
            <select 
              value={trustLevel}
              onChange={(e) => setTrustLevel(e.target.value as any)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none cursor-pointer"
            >
              <option value="Bajo">Bajo</option>
              <option value="Alto">Alto</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Criterios de Elegibilidad (un por línea)</label>
          <textarea 
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Ej. Ingreso mínimo $45,000&#10;Edad mínima 25 años&#10;Score Buró > 650"
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2.5 outline-none focus:bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ventajas del Producto</label>
          <textarea 
            rows={2}
            value={advantages}
            onChange={(e) => setAdvantages(e.target.value)}
            placeholder="Ej. Sin comisión por apertura&#10;Avalúo sin costo"
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2.5 outline-none focus:bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Riesgos u Observaciones</label>
          <textarea 
            rows={2}
            value={risks}
            onChange={(e) => setRisks(e.target.value)}
            placeholder="Ej. Penalización por prepago&#10;CAT muy volátil"
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2.5 outline-none focus:bg-white"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={handleSaveRate}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
          >
            <Save className="h-4 w-4" /> Guardar Producto
          </button>
          {isEditing && (
            <button 
              onClick={resetForm}
              className="p-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
              title="Cancelar Edición"
            >
              <Undo className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Roster de Tasas Administrables */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Tasas y Políticas de Crédito Disponibles</h4>
          <div className="overflow-x-auto border border-slate-150 rounded-lg">
            <table className="w-full text-xs text-left text-slate-600 font-medium">
              <thead className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-4 py-3">Banco / Producto</th>
                  <th className="px-4 py-3">Tasa Base</th>
                  <th className="px-4 py-3">CAT / Com.</th>
                  <th className="px-4 py-3">Estatus</th>
                  <th className="px-4 py-3">Última Mod.</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-800 font-bold">
                      {rate.bankName}
                      <span className="text-[10px] font-semibold text-slate-400 block">{rate.productName}</span>
                    </td>
                    <td className="px-4 py-3 text-emerald-700 font-extrabold">{rate.interestRate.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-slate-500">
                      CAT: {rate.cat.toFixed(1)}% / Com: {rate.commission}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        rate.status === 'Validado internamente' || rate.status === 'Actualizado' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-amber-50 text-amber-700 border-amber-250'
                      }`}>
                        {rate.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[10px]">
                      {rate.lastUpdated}
                      <span className="block text-[8px]">Por: {rate.verifiedBy}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleSelectRateForEdit(rate)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 rounded transition-all inline-block cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial Auditoría Tasas */}
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <History className="h-4.5 w-4.5 text-slate-400" />
            Historial de Cambios en Biblioteca Financiera
          </h4>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="border-l-2 border-slate-200 pl-4 py-1 text-xs">
                <div className="font-semibold text-slate-700">{log.change}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Banco: <strong className="text-slate-500">{log.bank}</strong> · Responsable: {log.broker} · {new Date(log.timestamp).toLocaleString('es-MX')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
