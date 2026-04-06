import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DiplomaView from './components/DiplomaView'
import Home from './components/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Definimos la ruta dinámica con el parámetro :code */}
        <Route path="/fedatario-juramentado/:code" element={<DiplomaView />} />

        {/* Redirección por defecto si entran a la raíz (puedes crear una landing luego) */}
        <Route path="/" element={<Home />} />

        {/* Manejo de rutas 404 (puedes personalizarla luego) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
