import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import DiplomaView from './components/DiplomaView'
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
        <Route path="/fedatario-juramentado/:code" element={<DiplomaView />} />

        {/* Rutas alternativas por si el QR apunta a otra ruta */}
        <Route path="/certificados/:code" element={<RedirectToDiploma />} />
        <Route path="/diplomado/:code" element={<RedirectToDiploma />} />

        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
