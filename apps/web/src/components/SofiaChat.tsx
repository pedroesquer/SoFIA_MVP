import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, User, MortgageFile, BankRate } from '../types';
import { authenticatedFetch } from '../lib/api';
import sofiaMark from '../assets/brand/sofia-mark-transparent.png';
import {
  Send,
  Clock,
  HelpCircle,
  Trash2,
  FileText,
  Compass,
  ArrowRight,
  ShieldCheck,
  Mic,
  MicOff,
  Square,
  AlertCircle
} from 'lucide-react';

interface SofiaChatProps {
  currentUser: User;
  activeFile?: MortgageFile;
  rates: BankRate[];
}

// Global declaration for SpeechRecognition window extension
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
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
  
  // Voice Recording / Dictation State
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [wasVoiceNote, setWasVoiceNote] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up recognition and timer on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startVoiceDictation = () => {
    setSpeechError(null);
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError('Tu navegador no soporta el reconocimiento de voz. Te recomendamos usar Google Chrome o Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-MX';

      let initialText = inputText ? `${inputText.trim()} ` : '';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(initialText + transcript);
        setWasVoiceNote(true);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Permiso de micrófono denegado. Por favor, habilita el micrófono en tu navegador.');
        } else if (event.error !== 'no-speech') {
          setSpeechError('No se pudo procesar la voz. Inténtalo de nuevo.');
        }
        stopVoiceDictation();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setSpeechError('No fue posible iniciar el dictado por voz.');
      setIsListening(false);
    }
  };

  const stopVoiceDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsListening(false);
  };

  const toggleVoiceDictation = () => {
    if (isListening) {
      stopVoiceDictation();
    } else {
      startVoiceDictation();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (isListening) {
      stopVoiceDictation();
    }

    const isVoice = !textToSend && wasVoiceNote;

    if (!textToSend) {
      setInputText('');
    }
    setWasVoiceNote(false);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      isVoiceNote: isVoice
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await authenticatedFetch('/api/sofia/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg]
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

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-178px)] min-h-[480px] lg:h-[calc(100vh-128px)] bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden" id="sofia-chat-panel">
      {/* Header del Chat */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 sm:items-center sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50 p-1 shadow-sm">
            <img src={sofiaMark} alt="" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-800 flex flex-wrap items-center gap-2">
              SoFIA Copiloto Hipotecario
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-full border border-emerald-200">AI Activa</span>
            </h2>
            <p className="truncate text-[11px] text-slate-500">
              {activeFile ? `Contexto activo: ${activeFile.name}` : 'Especializada en tasas y políticas de crédito'}
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          title="Limpiar Conversación"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Banner de error de micrófono o voz */}
      {speechError && (
        <div className="px-4 py-2 bg-rose-50 border-b border-rose-150 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-bold underline cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Historial de Mensajes */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 sm:gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'sofia' && (
              <div className="w-8 h-8 overflow-hidden rounded-lg bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center flex-shrink-0 mt-1">
                <img src={sofiaMark} alt="SoFIA" className="h-full w-full object-contain" />
              </div>
            )}
            <div className={`min-w-0 max-w-[88%] rounded-xl p-3 sm:max-w-[85%] sm:p-4 shadow-sm leading-relaxed text-sm ${message.sender === 'user'
                ? 'bg-slate-900 text-white rounded-br-none'
                : 'bg-slate-50 border border-slate-150 text-slate-900 rounded-bl-none'
              }`}>
              {message.sender === 'user' && message.isVoiceNote && (
                <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-800 text-[10px] text-emerald-400 font-semibold tracking-wide">
                  <Mic className="h-3 w-3" />
                  <span>Nota de voz transcrita</span>
                </div>
              )}
              <div className={`markdown-body ${message.sender === 'user' ? 'user-message-markdown' : ''}`}>
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
            <div className="w-8 h-8 overflow-hidden rounded-lg bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center flex-shrink-0 animate-pulse">
              <img src={sofiaMark} alt="SoFIA" className="h-full w-full object-contain" />
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
      {messages.length === 1 && !isListening && (
        <div className="px-4 sm:px-6 py-2.5 border-t border-slate-100 bg-slate-50/50 max-h-36 overflow-y-auto sm:max-h-none">
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
                  className="text-xs font-medium text-slate-600 bg-white hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-lg text-left transition-all flex items-center gap-1 cursor-pointer"
                >
                  {q.label}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Banner de Grabación Activa */}
      {isListening && (
        <div className="px-4 py-2 bg-rose-500 text-white text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 animate-spin" />
            <span>Escuchando tu nota de voz... Dicta tu consulta a SoFIA</span>
          </div>
          <span className="font-mono bg-rose-700 px-2 py-0.5 rounded text-[11px]">
            {formatSeconds(recordingSeconds)}
          </span>
        </div>
      )}

      {/* Input de Mensaje */}
      <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2.5 items-center relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            placeholder={
              isListening
                ? "Dictando nota de voz..."
                : activeFile
                ? `Pregunta a SoFIA sobre el caso de ${activeFile.name}...`
                : "Escribe una pregunta sobre políticas, tasas o dicta con el micrófono..."
            }
            className={`flex-1 text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border rounded-lg px-4 py-3 pr-24 outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium ${
              isListening ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
            }`}
          />

          {/* Botón de Dictado por Voz (Micrófono) */}
          <button
            type="button"
            onClick={toggleVoiceDictation}
            disabled={isLoading}
            title={isListening ? "Detener dictado de voz" : "Dictar nota de voz"}
            className={`absolute right-12 p-2 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
            }`}
          >
            {isListening ? (
              <>
                <Square className="h-4 w-4 fill-white" />
                <span className="text-[10px] font-mono font-bold hidden sm:inline">
                  {formatSeconds(recordingSeconds)}
                </span>
              </>
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          {/* Botón de Enviar */}
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
