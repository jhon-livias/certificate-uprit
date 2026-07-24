import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileDown, CheckCircle, ShieldCheck, BadgeCheck,
  ArrowLeft, AlertCircle, Lock, IdCard,
} from 'lucide-react';

const TIPO_LABELS = {
  posgrado:           'Maestría',
  bachiller:          'Bachiller',
  'titulo-profesional': 'Título Profesional',
};

export default function DiplomaGradoView({ tipo }) {
  const { codigo } = useParams();
  const navigate   = useNavigate();

  const [dniInput,      setDniInput]      = useState('');
  const [verified,      setVerified]      = useState(false);
  const [verifyError,   setVerifyError]   = useState(false);
  const [attempts,      setAttempts]      = useState(0);
  const [verifying,     setVerifying]     = useState(false);
  const [downloading,   setDownloading]   = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [studentName,   setStudentName]   = useState('');
  const [programa,      setPrograma]      = useState('');

  const dniRef         = useRef(null);
  const verifiedDniRef = useRef('');

  const tipoLabel = TIPO_LABELS[tipo] ?? 'Diploma';

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(false);

    const dni = dniInput.trim();

    try {
      const response = await fetch('/api/verify-grado', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: codigo, dni }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok || !data.nombre) {
        setAttempts(prev => prev + 1);
        setVerifyError(true);
        setDniInput('');
        setTimeout(() => dniRef.current?.focus(), 50);
        return;
      }

      verifiedDniRef.current = dni;
      setStudentName(data.nombre);
      setPrograma(data.programa);
      setVerified(true);
    } catch {
      setVerifyError(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(false);

    const dni = verifiedDniRef.current || dniInput.trim();
    if (!dni) {
      setDownloadError(true);
      setDownloading(false);
      return;
    }

    try {
      const response = await fetch('/api/download-grado', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: codigo, dni }),
      });

      const contentType = response.headers.get('content-type') ?? '';
      const buffer      = await response.arrayBuffer();

      if (!response.ok || !contentType.includes('application/pdf')) {
        throw new Error('Invalid response');
      }

      const header = new TextDecoder().decode(new Uint8Array(buffer.slice(0, 4)));
      if (header !== '%PDF') throw new Error('Corrupt PDF');

      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = `${codigo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  // ── Gate de verificación ────────────────────────────────────────────────────
  if (!verified) {
    return (
      <div className="min-h-screen bg-[#F2EFE9] font-geist flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-uprit-red rounded p-2 shadow-md mb-4">
              <img src="/logo/logo.svg" alt="logo-uprit" width={110} />
            </div>
            <p className="text-[10px] text-uprit-gray/40 uppercase tracking-[0.25em] text-center">
              Universidad Privada de Trujillo
            </p>
          </div>

          {/* Tarjeta */}
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="h-1.5 w-full bg-uprit-red" />
            <div className="h-px w-full bg-[#C9A227]" />

            <div className="p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="border-2 border-uprit-gray/20 rounded-full p-4 mb-4">
                  <Lock className="w-7 h-7 text-uprit-gray/50" />
                </div>
                <h2 className="text-lg font-extrabold text-uprit-gray uppercase tracking-widest text-center">
                  Verificación requerida
                </h2>
                <p className="text-xs text-gray-400 text-center mt-2 leading-relaxed">
                  Ingresa tu DNI para acceder al{' '}
                  <span className="font-bold text-uprit-gray">{tipoLabel}</span>{' '}
                  asociado al código{' '}
                  <span className="font-mono font-bold text-uprit-gray break-all">{codigo || '—'}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-1.5 block">
                    Número de DNI
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      ref={dniRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={12}
                      value={dniInput}
                      onChange={e => {
                        setDniInput(e.target.value.replace(/\D/g, ''));
                        setVerifyError(false);
                      }}
                      placeholder="Ej: 12345678"
                      autoFocus
                      className={`w-full pl-9 pr-4 py-3 border rounded-lg font-mono text-sm text-uprit-gray tracking-widest outline-none transition-all
                        ${verifyError
                          ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
                          : 'border-gray-200 bg-gray-50 focus:border-uprit-red focus:ring-2 focus:ring-uprit-red/20'}`}
                    />
                  </div>
                  {verifyError && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-500">
                        DNI incorrecto o diploma no encontrado.
                        {attempts >= 3 && ' Verifica que el código QR sea el correcto.'}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={dniInput.length < 7 || verifying}
                  className="bg-uprit-red hover:bg-red-900 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all tracking-[0.15em] uppercase text-sm shadow-md shadow-uprit-red/20"
                >
                  <ShieldCheck size={16} />
                  {verifying ? 'Verificando…' : 'Verificar identidad'}
                </button>
              </form>
            </div>

            <div className="h-px w-full bg-[#C9A227]" />
            <div className="h-1.5 w-full bg-uprit-red" />
          </div>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-6">
            Sistema de validación oficial UPRIT
          </p>
        </div>
      </div>
    );
  }

  // ── Vista tras verificación ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F2EFE9] font-geist flex flex-col items-center py-8 px-4">

      {/* Barra superior */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-uprit-gray/50 hover:text-uprit-gray text-sm transition-colors"
        >
          <ArrowLeft size={15} />
          <span className="tracking-wide">Volver</span>
        </button>
        <div className="flex items-center gap-2 text-[10px] text-uprit-gray/40 tracking-[0.2em] uppercase">
          <ShieldCheck size={13} />
          <span>Verificación oficial UPRIT</span>
        </div>
      </div>

      {/* Banner de verificación */}
      <div className="w-full max-w-3xl bg-emerald-950 border border-emerald-800/40 rounded-xl p-4 flex items-center gap-4 mb-6 shadow-lg">
        <div className="bg-emerald-500 rounded-full p-1.5 flex-shrink-0 shadow-md shadow-emerald-500/30">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-emerald-300 text-sm font-bold tracking-wide uppercase">Documento auténtico verificado</p>
          <p className="text-emerald-600/80 text-xs mt-0.5 leading-relaxed">
            Este diploma ha sido validado en la base de datos oficial de la Universidad Privada de Trujillo.
          </p>
        </div>
        <BadgeCheck className="text-emerald-400/70 w-7 h-7 flex-shrink-0" />
      </div>

      {/* Certificado */}
      <main className="w-full max-w-3xl bg-white shadow-2xl overflow-hidden">
        <div className="h-2 w-full bg-uprit-red" />
        <div className="h-px w-full bg-[#C9A227]" />

        <div className="p-8 md:p-14 flex flex-col">

          {/* Cabecera: logo + código */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-uprit-red rounded p-1 shadow-sm">
                <img src="/logo/logo.svg" alt="logo-uprit" width={130} />
              </div>
              <div className="border-l border-gray-200 pl-3">
                <p className="text-uprit-gray font-bold text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                  Universidad<br />Privada de<br />Trujillo
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-1">N.° de Registro</p>
              <p className="text-uprit-gray font-mono font-bold text-xs tracking-wider break-all max-w-[160px] text-right">
                {codigo}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Activo</span>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-uprit-red/80 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-[#C9A227]" />
            <div className="h-px flex-1 bg-gradient-to-l from-uprit-red/80 to-transparent" />
          </div>

          {/* Título */}
          <div className="text-center mb-10">
            <p className="text-[10px] text-gray-400 tracking-[0.4em] uppercase mb-2">Diploma de</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-uprit-red uppercase tracking-widest">
              {tipoLabel}
            </h1>
          </div>

          {/* Contenido */}
          <div className="flex flex-col items-center text-center">

            <div className="relative mb-8">
              <div className="border-2 border-[#C9A227] rounded-full p-5">
                <ShieldCheck className="w-12 h-12 text-[#C9A227]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-md">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-3">Diploma válido emitido a</p>

            <p className="text-xl md:text-2xl font-extrabold text-uprit-gray uppercase tracking-wide mb-2 max-w-lg">
              {studentName}
            </p>

            {/* Programa */}
            <div className="bg-uprit-red/5 border border-uprit-red/15 rounded-lg px-6 py-4 mb-10 max-w-md w-full mt-4">
              <p className="text-[10px] text-uprit-red/60 uppercase tracking-[0.3em] mb-1">Programa</p>
              <p className="text-sm font-bold text-uprit-red uppercase tracking-wide leading-snug">
                {programa}
              </p>
            </div>

            {/* Registro y Año */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-10">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] mb-1">Tipo</p>
                <p className="font-bold text-uprit-gray text-xs leading-snug uppercase">{tipoLabel}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] mb-1">Año</p>
                <p className="font-bold text-uprit-gray text-sm">2026</p>
              </div>
            </div>

            {/* Institución */}
            <div className="w-full max-w-lg border-t border-dashed border-gray-200 pt-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center mb-2">
                Emitido por
              </p>
              <p className="text-xs text-gray-400 leading-relaxed text-center">
                Universidad Privada de Trujillo — UPRIT · Sede Central, Trujillo, Perú · www.uprit.edu.pe
              </p>
            </div>
          </div>

          {/* Separador inferior */}
          <div className="flex items-center gap-3 mt-10">
            <div className="h-px flex-1 bg-gradient-to-r from-uprit-red/80 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-[#C9A227]" />
            <div className="h-px flex-1 bg-gradient-to-l from-uprit-red/80 to-transparent" />
          </div>

          {/* Pie */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sede Central UPRIT — Trujillo</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">www.uprit.edu.pe</p>
          </div>
        </div>

        <div className="h-px w-full bg-[#C9A227]" />
        <div className="h-2 w-full bg-uprit-red" />
      </main>

      {/* Botón de descarga */}
      <div className="mt-8 mb-12 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="bg-uprit-red hover:bg-red-900 disabled:bg-red-900/60 disabled:cursor-wait text-white font-bold py-3.5 px-10 rounded flex items-center gap-3 transition-all shadow-lg shadow-uprit-red/20 active:scale-[0.97] tracking-[0.15em] uppercase text-sm"
        >
          <FileDown size={18} />
          {downloading ? 'Preparando PDF…' : 'Descargar PDF Oficial'}
        </button>
        {downloadError && (
          <p className="text-red-500 text-xs text-center max-w-xs">
            No se pudo descargar el PDF. Intenta nuevamente.
          </p>
        )}
        <p className="text-gray-400 text-[10px] uppercase tracking-widest">
          Documento oficial — Universidad Privada de Trujillo
        </p>
      </div>

    </div>
  );
}
