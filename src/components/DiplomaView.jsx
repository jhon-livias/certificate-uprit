import { useParams, useNavigate } from 'react-router-dom';
import { FileDown, CheckCircle, ShieldCheck, BadgeCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import diplomasData from '../data/diplomas.json';

export default function DiplomaView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const normalizedCode = code?.trim().toUpperCase() ?? '';

  const student = diplomasData.find(item => item.registro === normalizedCode);

  const studentName = student ? student.nombre : null;
  const diplomaCodeDisplay = student ? student.registro : (normalizedCode || '……-FJEI-2026');

  const pdfUrl = `/diplomado/${diplomaCodeDisplay}.pdf`;
  const isValid = Boolean(student);

  return (
    <div className="min-h-screen bg-[#F2EFE9] font-geist flex flex-col items-center py-8 px-4">

      {/* Barra superior de navegación */}
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

      {/* Banner de estado de verificación */}
      {isValid ? (
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
      ) : (
        <div className="w-full max-w-3xl bg-red-950 border border-red-800/40 rounded-xl p-4 flex items-center gap-4 mb-6 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">
            El código <span className="font-mono font-bold">{normalizedCode}</span> no figura en la base de datos. Verifique que sea correcto.
          </p>
        </div>
      )}

      {/* Certificado */}
      <main className="w-full max-w-3xl bg-white shadow-2xl overflow-hidden">
        {/* Acento rojo + dorado superior */}
        <div className="h-2 w-full bg-uprit-red" />
        <div className="h-px w-full bg-[#C9A227]" />

        <div className="p-8 md:p-14 flex flex-col">

          {/* Cabecera: logo + número de registro */}
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
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-1">Documento N.°</p>
              <p className="text-uprit-gray font-mono font-bold text-sm tracking-wider">{diplomaCodeDisplay}</p>
              {isValid && (
                <div className="flex items-center justify-end gap-1.5 mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Activo</span>
                </div>
              )}
            </div>
          </div>

          {/* Separador decorativo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-uprit-red/80 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-[#C9A227]" />
            <div className="h-px flex-1 bg-gradient-to-l from-uprit-red/80 to-transparent" />
          </div>

          {/* Título del documento */}
          <div className="text-center mb-10">
            <p className="text-[10px] text-gray-400 tracking-[0.4em] uppercase mb-2">Constancia de</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-uprit-red uppercase tracking-widest">
              Validación de Diploma
            </h1>
          </div>

          {isValid ? (
            <div className="flex flex-col items-center text-center">

              {/* Sello de verificación */}
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
                  Fedatario Juramentado con<br />Especialización en Informática
                </p>
              </div>

              {/* Registro y Vigencia */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-10">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] mb-1">Registro</p>
                  <p className="font-mono font-bold text-uprit-gray text-sm">{diplomaCodeDisplay}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] mb-1">Vigencia</p>
                  <p className="font-bold text-uprit-gray text-xs leading-snug">Abr. 2026<br />— Abr. 2031</p>
                </div>
              </div>

              {/* Autorización */}
              <div className="w-full max-w-lg border-t border-dashed border-gray-200 pt-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center mb-2">
                  Autorizado por
                </p>
                <p className="text-xs text-gray-400 leading-relaxed text-center">
                  Informe N.° 270-2025-JUS/DGDNCR-DDJCR (27 oct. 2025) e Informe N.° 305-2025-JUS/DGDNCR-DDJCR (2 dic. 2025) — Dirección de Desarrollo Jurídico y Calidad Regulatoria, Ministerio de Justicia y Derechos Humanos del Perú.
                </p>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-10">
              <AlertCircle className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-uprit-gray/40 text-sm">
                El código <span className="font-mono font-bold">{normalizedCode}</span> no está registrado en el sistema.
              </p>
            </div>
          )}

          {/* Separador decorativo inferior */}
          <div className="flex items-center gap-3 mt-10">
            <div className="h-px flex-1 bg-gradient-to-r from-uprit-red/80 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-[#C9A227]" />
            <div className="h-px flex-1 bg-gradient-to-l from-uprit-red/80 to-transparent" />
          </div>

          {/* Pie del documento */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sede Central UPRIT — Trujillo</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">www.uprit.edu.pe</p>
          </div>
        </div>

        {/* Acento inferior */}
        <div className="h-px w-full bg-[#C9A227]" />
        <div className="h-2 w-full bg-uprit-red" />
      </main>

      {/* Botón de descarga */}
      {isValid && (
        <div className="mt-8 mb-12 flex flex-col items-center gap-2">
          <a
            href={pdfUrl}
            download={`${diplomaCodeDisplay}.pdf`}
            className="bg-uprit-red hover:bg-red-900 text-white font-bold py-3.5 px-10 rounded flex items-center gap-3 transition-all shadow-lg shadow-uprit-red/20 active:scale-[0.97] tracking-[0.15em] uppercase text-sm"
          >
            <FileDown size={18} />
            Descargar PDF Oficial
          </a>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest">
            Documento oficial — Universidad Privada de Trujillo
          </p>
        </div>
      )}

    </div>
  );
}
