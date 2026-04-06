import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  const handleBuscar = (e) => {
    e.preventDefault();
    if (codigo.trim()) {
      // Redirigimos a la ruta del diploma que creamos antes
      // Usamos toUpperCase() por si lo escriben en minúsculas
      navigate(`/fedatario-juramentado/${codigo.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-uprit-bg font-geist flex flex-col items-center justify-center p-4">
      
      {/* Tarjeta Principal */}
      <main className="w-full max-w-lg bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Decoración superior (línea roja) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-uprit-red"></div>

        {/* Icono de Seguridad */}
        <div className="bg-green-50 p-4 rounded-full mb-6">
          <ShieldCheck className="w-12 h-12 text-green-600" />
        </div>

        {/* Títulos */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-uprit-gray mb-2">
          Verificación de Diplomas
        </h1>
        <p className="text-uprit-gray/80 text-sm md:text-base mb-8">
          Ingresa el código de registro del documento o escanea el código QR impreso para verificar su autenticidad.
        </p>

        {/* Formulario de Búsqueda */}
        <form onSubmit={handleBuscar} className="w-full flex flex-col gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Ej. 001-FJEI-2026" 
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl text-center text-lg uppercase font-bold text-uprit-gray tracking-widest focus:border-uprit-red focus:outline-none transition-colors shadow-sm"
              required
            />
            {/* Icono de QR pequeñito dentro del input para dar contexto */}
            <QrCode className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          </div>

          <button 
            type="submit"
            className="w-full bg-uprit-red hover:bg-red-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-lg"
          >
            <Search size={20} />
            VERIFICAR DIPLOMA
          </button>
        </form>

      </main>

      {/* Footer minimalista */}
      <footer className="mt-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
           <span className="text-uprit-red font-bold text-lg italic">UPRIT</span>
        </div>
        © {new Date().getFullYear()} Universidad Privada de Trujillo.<br/>Todos los derechos reservados.
      </footer>
    </div>
  );
}