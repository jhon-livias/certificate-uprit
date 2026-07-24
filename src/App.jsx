import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import DiplomaView from './components/DiplomaView'
import DiplomaGradoView from './components/DiplomaGradoView'
import Home from './components/Home'

function RedirectToDiploma() {
  const { code } = useParams()
  const normalizedCode = code?.trim().toUpperCase().replace(/\.PDF$/, '') ?? ''
  return <Navigate to={`/fedatario-juramentado/${normalizedCode}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Fedatario Juramentado */}
        <Route path="/fedatario-juramentado/:code" element={<DiplomaView />} />
        <Route path="/certificados/:code" element={<RedirectToDiploma />} />
        <Route path="/diplomado/:code" element={<RedirectToDiploma />} />

        {/* Diplomas de grado — rutas generadas por uprit-diplomas QR */}
        <Route path="/2026/7/posgrado/:codigo"                    element={<DiplomaGradoView tipo="posgrado" />} />
        <Route path="/2026/7/pregrado/bachiller/:codigo"          element={<DiplomaGradoView tipo="bachiller" />} />
        <Route path="/2026/7/pregrado/titulo-profesional/:codigo" element={<DiplomaGradoView tipo="titulo-profesional" />} />

        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
