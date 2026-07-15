import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, User, MortgageFile, BankRate } from '../types';
import { 
  Send, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  Trash2, 
  FileText, 
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface SofiaChatProps {
  currentUser: User;
  activeFile?: MortgageFile;
  rates: BankRate[];
}

export default function SofiaChat({ currentUser, activeFile, rates }: SofiaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'sofia',
      text: `### 👋 ¡Hola! Soy SoFIA, tu Copiloto Inteligente de Crédito Hipotecario.

Estoy lista para apoyarte en la estructuración de créditos, análisis de políticas de bancos y diagnóstico de expedientes de **CREDIDIEZ**.

${activeFile ? `📍 Actualmente detecto que estás trabajando con el expediente de **${activeFile.name}**. Puedes preguntarme sobre su viabilidad o viabilidad por banco.` : '💡 Selecciona un expediente en la sección de CRM o pregúntame directamente sobre cualquier política bancaria de nuestra biblioteca.'}

Aquí tienes algunas consultas frecuentes que puedo resolver en segundos:`,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/sofia/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          clientContext: activeFile ? {
            name: activeFile.name,
            age: activeFile.age,
            economicActivity: activeFile.economicActivity,
            monthlyIncome: activeFile.monthlyIncome,
            monthlyExpenses: activeFile.monthlyExpenses,
            otherDebts: activeFile.otherDebts,
            requestedAmount: activeFile.requestedAmount,
            propertyValue: activeFile.propertyValue,
            termYears: activeFile.termYears,
            buroScore: activeFile.buro.score,
            buroAuthStatus: activeFile.buro.authStatus
          } : null,
          ratesContext: rates.map(r => ({
            bankName: r.bankName,
            productName: r.productName,
            interestRate: r.interestRate,
            cat: r.cat,
            commission: r.commission,
            requirements: r.requirements,
            status: r.status
          }))
        })
      });

      if (!response.ok) {
        throw new Error('La respuesta del servidor no fue exitosa.');
      }

      const data = await response.json();
      
      const sofiaMsg: ChatMessage = {
        id: `msg-${Date.now()}-sofia`,
        sender: 'sofia',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, sofiaMsg]);
    } catch (error) {
      console.error('Error in chat request:', error);
      
      // Fallback simulated message
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-sofia-error`,
        sender: 'sofia',
        text: `### ⚠️ Hubo una interrupción en mi conexión

No te preocupes, tengo las políticas locales precargadas en mi motor de contingencia:
- **Tasa Líder:** Scotiabank 7X a **9.90%** (Cero comisión por apertura).
- **Aprobación Express:** BBVA (72 horas con expediente digitalizado).
- **Riesgo:** El endeudamiento total (DTI) no debe rebasar el **45%** del ingreso mensual bruto comprobable.

*Por favor, verifica tu conexión a internet o los secretos del API Key en el menú de configuración de AI Studio si el problema persiste.*`,
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('¿Seguro que deseas reiniciar el historial del chat con SoFIA?')) {
      setMessages([
        {
          id: 'welcome',
          sender: 'sofia',
          text: `### 👋 Historial reiniciado. ¿En qué te puedo apoyar ahora?
  
Pregúntame sobre tasas hipotecarias, viabilidad de prospectos o estrategias comerciales de CREDIDIEZ.`,
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const suggestedQuestions = [
    { label: '📊 Compara Scotiabank con Santander', query: 'Compara Scotiabank con Santander en una tabla, mostrando tasas, mensualidades y CAT.' },
    { label: '🛡️ ¿Cuáles son las políticas de Buró?', query: 'Cuáles son las políticas y scores de Buró de Crédito mínimos aceptables?' },
    { label: '📁 Checklist de expediente completo', query: 'Cuáles son los requisitos de documentación para armar un expediente de asalariado e independiente?' },
    { label: '💵 Analiza el expediente activo', query: `Analiza la viabilidad del cliente actual ${activeFile ? activeFile.name : ''} basándote en sus ingresos y deudas.` }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden" id="sofia-chat-panel">
      {/* Header del Chat */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              SoFIA Copiloto Hipotecario
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-full border border-emerald-200">AI Activa</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              {activeFile ? `Contexto activo: ${activeFile.name}` : 'Especializada en tasas y políticas de crédito'}
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
          title="Limpiar Conversación"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Historial de Mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'sofia' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                SF
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl p-4 shadow-sm leading-relaxed text-sm ${
              message.sender === 'user' 
                ? 'bg-slate-850 text-white rounded-br-none' 
                : 'bg-slate-50 border border-slate-150 text-slate-850 rounded-bl-none'
            }`}>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
              </div>
              <div className={`flex items-center gap-1 mt-2.5 text-[10px] ${message.sender === 'user' ? 'text-slate-300 justify-end' : 'text-slate-400'}`}>
                <Clock className="h-3 w-3" />
                <span>{message.timestamp}</span>
              </div>
            </div>
            {message.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-1">
                US
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-xs flex-shrink-0 animate-pulse">
              SF
            </div>
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 shadow-sm rounded-bl-none max-w-[85%] flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span className="text-xs text-slate-500 ml-1.5 font-medium">SoFIA está consultando políticas de crédito...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugerencias Rápidas */}
      {messages.length === 1 && (
        <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5" /> Atajos Rápidos de Consulta
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => {
              // disable active file suggestion if no file is selected
              if (idx === 3 && !activeFile) return null;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.query)}
                  className="text-xs font-medium text-slate-600 bg-white hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-lg text-left transition-all flex items-center gap-1"
                >
                  {q.label}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input de Mensaje */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2.5 items-center relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            placeholder={activeFile ? `Pregunta a SoFIA sobre el caso de ${activeFile.name}...` : "Escribe una pregunta sobre políticas, tasas o expedientes..."}
            className="flex-1 text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-4 py-3 pr-12 outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="absolute right-2 px-3 py-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-300 rounded-md shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
          SoFIA responde con base en las circulares oficiales y la Biblioteca Financiera integrada de CREDIDIEZ.
        </p>
      </div>
    </div>
  );
}
