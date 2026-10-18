import { useEffect } from 'react'

export function Cartao({ titulo, acao, children, className = '' }) {
  return (
    <section className={`cartao ${className}`}>
      {(titulo || acao) && (
        <div className="cartao-cabecalho">
          {titulo ? <h2>{titulo}</h2> : <span />}
          {acao}
        </div>
      )}
      {children}
    </section>
  )
}

export function Campo({ rotulo, children, ...props }) {
  return (
    <label className="campo">
      {rotulo}
      {children ?? <input {...props} />}
    </label>
  )
}

export function Barra({ valor, meta, cor = '' }) {
  const pct = meta > 0 ? Math.min(100, Math.round((valor / meta) * 100)) : 0
  return (
    <div className={`progresso ${cor}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Erro({ children }) {
  if (!children) return null
  return <div className="aviso" role="alert">{children}</div>
}

export function Sucesso({ children }) {
  if (!children) return null
  return <div className="aviso sucesso" role="status">{children}</div>
}

export function Carregando({ texto = 'Carregando…' }) {
  return <p className="vazio">{texto}</p>
}

export function Modal({ titulo, aoFechar, children }) {
  useEffect(() => {
    const porEscape = (e) => e.key === 'Escape' && aoFechar()
    document.addEventListener('keydown', porEscape)
    return () => document.removeEventListener('keydown', porEscape)
  }, [aoFechar])

  return (
    <div className="fundo-modal" onClick={aoFechar}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="cartao-cabecalho">
          <h2>{titulo}</h2>
          <button type="button" className="fantasma pequeno" onClick={aoFechar}>Fechar</button>
        </div>
        {children}
      </div>
    </div>
  )
}
