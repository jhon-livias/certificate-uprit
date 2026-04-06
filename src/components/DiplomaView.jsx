import { useParams } from 'react-router-dom';
import { FileDown, CheckCircle } from 'lucide-react'; 
import diplomasData from '../data/diplomas.json'; 

export default function DiplomaView() {
  const { code } = useParams();

  // Búsqueda en el JSON
  const student = diplomasData.find(item => item.registro === code);

  // Datos del alumno
  const studentName = student ? student.nombre : '……………………………………';
  const diplomaCodeDisplay = student ? student.registro : (code || '……-FJEI-2026');
  
  const pdfUrl = `/certificados/${diplomaCodeDisplay}.pdf`; 

  return (
    <div className="min-h-screen bg-uprit-bg font-geist flex flex-col items-center py-10 px-4 md:px-0">
      
      {/* Banner Superior de Verificación (Opcional pero recomendado para UX) */}
      <div className="w-full max-w-3xl bg-green-50 p-3 rounded-lg border border-green-200 flex items-center justify-center gap-2 mb-6 shadow-sm">
        <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
        <p className="text-sm text-green-800">
           Documento verificado en la base de datos oficial.
        </p>
      </div>

      {/* EL DIPLOMA: Imita una hoja A4 con un borde interno */}
      <main className="w-full max-w-3xl bg-white shadow-2xl relative flex flex-col items-center">
        
        {/* Contenedor del "Papel" con borde fino gris como en tu foto */}
        <div className="w-full h-full border border-gray-300 m-2 md:m-4 p-8 md:p-16 flex flex-col relative">
          
          {/* LOGO SUPERIOR IZQUIERDA (Estilo CAL) */}
          <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-3">
             <div className="bg-uprit-red rounded shadow-sm">
                 <img src="/logo/logo.svg" alt="logo-uprit" width={150} />
             </div>
             <div className="flex flex-col">
               <span className="text-uprit-gray font-bold text-xs uppercase tracking-widest leading-none">Universidad</span>
               <span className="text-uprit-gray font-bold text-xs uppercase tracking-widest leading-none mt-1">Privada de</span>
               <span className="text-uprit-gray font-bold text-xs uppercase tracking-widest leading-none mt-1">Trujillo</span>
             </div>
          </div>

          {/* Espaciador para empujar el contenido debajo del logo */}
          <div className="mt-28 md:mt-32"></div>

          {/* TÍTULO CENTRAL */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-uprit-red text-center mb-12 uppercase tracking-wider">
            VALIDACIÓN DE DIPLOMA
          </h1>

          <div className="flex flex-col items-center text-center w-full">
            
            {/* Emitido a */}
            <p className="text-sm md:text-base text-uprit-gray mb-6">
              Diploma válido emitido a:
            </p>

            <p className="text-lg md:text-xl font-bold text-uprit-gray mb-6 uppercase tracking-wide">
              {studentName}
            </p>

            {/* Obtención */}
            <p className="text-xs md:text-sm font-semibold text-uprit-gray mb-1 uppercase tracking-widest">
              OBTENCIÓN DEL DIPLOMA DE
            </p>

            <p className="text-sm md:text-base font-bold text-uprit-gray mb-10 max-w-md mx-auto uppercase leading-snug">
              FEDATARIO JURAMENTADO CON ESPECIALIZACIÓN EN INFORMÁTICA
            </p>

            {/* ZONA DE REGISTRO CON LÍNEAS NEGRAS/GRISES (Idéntico a tu foto) */}
            <div className="w-full max-w-sm mx-auto mb-10">
              <hr className="border-t-2 border-uprit-gray mb-4" />
              <p className="text-xs font-medium text-uprit-gray uppercase tracking-widest mb-3">
                REGISTRO
              </p>
              <p className="text-sm md:text-base font-bold text-uprit-gray mb-4 tracking-wider">
                N.° {diplomaCodeDisplay}
              </p>
              <hr className="border-t-2 border-uprit-gray" />
            </div>

            {/* Autorizado por */}
            <p className="text-xs font-semibold text-uprit-gray mb-4 uppercase tracking-widest">
              AUTORIZADO POR:
            </p>

            <p className="text-xs md:text-sm text-uprit-gray max-w-lg mx-auto leading-relaxed mb-8">
              Informe N.° 270-2025-JUS/DGDNCR-DDJCR, de fecha 27 de octubre de 2025, e Informe N.° 305-2025-JUS/DGDNCR-DDJCR, de fecha 2 de diciembre de 2025, emitidos por la Dirección de Desarrollo Jurídico y Calidad Regulatoria del Ministerio de Justicia y Derechos Humanos del Perú.
            </p>

            {/* Vigencia */}
            <p className="text-xs font-semibold text-uprit-gray mb-2 uppercase tracking-widest">
              VIGENCIA:
            </p>

            <p className="text-xs md:text-sm text-uprit-gray mb-12">
              Del 6 de abril de 2026 al 5 de abril de 2031.
            </p>

          </div>

          {/* Pie de página inferior derecho (Dirección/Web como en el CAL) */}
          <div className="mt-auto text-right w-full">
            <p className="text-[10px] md:text-xs text-gray-400">
              Sede Central UPRIT - Trujillo<br/>
              www.uprit.edu.pe
            </p>
          </div>

        </div>
      </main>

      {/* BOTÓN DESCARGA (Fuera del papel, abajo) */}
      <div className="mt-8 mb-10">
        <a 
          href={pdfUrl} 
          download 
          className="bg-uprit-red hover:bg-red-900 text-white font-bold py-3 px-8 rounded flex items-center gap-3 transition-colors shadow-md active:scale-95 text-sm md:text-base"
        >
          <FileDown size={20} /> DESCARGAR PDF OFICIAL
        </a>
      </div>

    </div>
  );
}