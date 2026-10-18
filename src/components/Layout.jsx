import { NavLink, Outlet } from 'react-router-dom'
import {
  IconeCalendario,
  IconeDieta,
  IconeFicha,
  IconeMedidas,
  IconePainel,
  IconePerfil,
} from './Icones'

const PAGINAS = [
  { para: '/', rotulo: 'Painel', Icone: IconePainel },
  { para: '/treinos', rotulo: 'Treinos', Icone: IconeCalendario },
  { para: '/fichas', rotulo: 'Fichas', Icone: IconeFicha },
  { para: '/medidas', rotulo: 'Medidas', Icone: IconeMedidas },
  { para: '/dieta', rotulo: 'Dieta', Icone: IconeDieta },
]

export default function Layout() {
  return (
    <div className="app">
      <aside className="barra-lateral">
        <div className="marca">
          <img src="/icone.svg" alt="" />
          EvoluçãoFit
        </div>
        {PAGINAS.map(({ para, rotulo, Icone }) => (
          <NavLink key={para} to={para} end={para === '/'} className={({ isActive }) => (isActive ? 'ativo' : '')}>
            <Icone />
            {rotulo}
          </NavLink>
        ))}
        <NavLink to="/perfil" className={({ isActive }) => (isActive ? 'ativo' : '')} style={{ marginTop: 'auto' }}>
          <IconePerfil />
          Perfil e metas
        </NavLink>
      </aside>

      <main className="conteudo">
        <Outlet />
      </main>

      <nav className="nav-inferior">
        {PAGINAS.map(({ para, rotulo, Icone }) => (
          <NavLink key={para} to={para} end={para === '/'} className={({ isActive }) => (isActive ? 'ativo' : '')}>
            <Icone />
            {rotulo}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
