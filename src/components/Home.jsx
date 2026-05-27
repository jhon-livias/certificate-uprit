import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lock, ShieldCheck, BadgeCheck, Globe } from 'lucide-react';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  const handleBuscar = (e) => {
    e.preventDefault();
    if (codigo.trim()) {
      navigate(`/fedatario-juramentado/${codigo.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F1A] font-geist flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Fondo: línea roja superior + glow central */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-uprit-red" />
        <div className="absolute top-[3px] left-0 w-full h-px bg-[#C9A227]/25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-uprit-red/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-uprit-red/30" />
      </div>

      {/* Cabecera institucional */}
      <div className="flex items-center gap-4 mb-10 z-10">
        <img src="/logo/logo.svg" alt="UPRIT" className="h-12 w-auto" />
        <div className="border-l border-white/15 pl-4">
          <p className="text-white/40 text-[10px] tracking-[0.35em] uppercase">Universidad Privada de Trujillo</p>
          <p className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase mt-0.5">Portal de Verificación Oficial</p>
        </div>
      </div>

      {/* Tarjeta principal */}
      <main className="w-full max-w-md relative z-10 overflow-hidden rounded-2xl shadow-2xl">
        {/* Línea dorada top */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />

        <div className="bg-[#12141F] border border-white/8 rounded-2xl p-8 md:p-10">

          {/* Ícono de seguridad */}
          <div className="flex justify-center mb-7">
            <div className="relative">
              <div className="bg-uprit-red/10 border border-uprit-red/25 p-5 rounded-full">
                <ShieldCheck className="w-10 h-10 text-uprit-red" />
              </div>
              <div className="absolute -top-1 -right-1 bg-[#C9A227] rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Títulos */}
          <h1 className="text-white text-xl md:text-2xl font-extrabold text-center tracking-wider uppercase mb-1">
            Verificación Oficial
          </h1>
          <p className="text-white/30 text-[10px] text-center tracking-[0.25em] uppercase mb-7">
            Sistema Seguro de Autenticación de Diplomas
          </p>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-white/25 text-[10px] tracking-[0.25em] uppercase">Ingresa el código</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleBuscar} className="flex flex-col gap-3">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 w-4 h-4" />
              <input
                type="text"
                placeholder="Ej. 001-FJEI-2026"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-center text-base uppercase font-bold tracking-widest placeholder:text-white/18 focus:border-uprit-red/50 focus:bg-white/7 focus:outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-uprit-red hover:bg-red-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-uprit-red/20 active:scale-[0.98] tracking-[0.15em] uppercase text-sm"
            >
              <Search size={16} />
              Verificar Diploma
            </button>
          </form>

          {/* Indicadores de seguridad */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/8">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white/35 text-[10px] tracking-wider uppercase">Cifrado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="text-white/35 text-[10px] tracking-wider uppercase">Oficial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-white/35 text-[10px] tracking-wider uppercase">Público</span>
            </div>
          </div>
        </div>

        {/* Línea dorada bottom */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-white/20 text-[10px] tracking-[0.2em] uppercase z-10">
        © {new Date().getFullYear()} Universidad Privada de Trujillo — Todos los derechos reservados
      </footer>
    </div>
  );
}
