import React from 'react'
export default function Header(){
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Iglú" style={{width:40}} />
          <span className="font-medium">Iglú</span>
        </div>
        <nav>
          <a className="px-4">Iniciar Sesión</a>
          <button className="btn-primary">Registrarse</button>
        </nav>
      </div>
    </header>
  )
}
