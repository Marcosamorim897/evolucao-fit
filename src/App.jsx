import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './lib/auth'
import Dieta from './pages/Dieta'
import Fichas from './pages/Fichas'
import Login from './pages/Login'
import Medidas from './pages/Medidas'
import Painel from './pages/Painel'
import Perfil from './pages/Perfil'
import Treinos from './pages/Treinos'

export default function App() {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="tela-login">
        <div className="caixa-login">
          <div className="marca"><img src="/icone.svg" alt="" /> EvoluçãoFit</div>
          <p className="frase">Carregando…</p>
        </div>
      </div>
    )
  }

  if (!usuario) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Painel />} />
        <Route path="/treinos" element={<Treinos />} />
        <Route path="/fichas" element={<Fichas />} />
        <Route path="/medidas" element={<Medidas />} />
        <Route path="/dieta" element={<Dieta />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
