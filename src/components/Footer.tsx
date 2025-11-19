import React from 'react'
export default function Footer(){
  return (
    <footer className="bg-teal-800 text-white mt-12">
      <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold">Iglú</h3>
          <p className="mt-2 text-sm">Plataforma de videoconferencias en tiempo real con chat, audio y video.</p>
        </div>
        <div>
          <h4 className="font-semibold">Producto</h4>
          <ul className="mt-2 text-sm"><li>Características</li><li>Precios</li></ul>
        </div>
        <div>
          <h4 className="font-semibold">Empresa</h4>
          <ul className="mt-2 text-sm"><li>Sobre Nosotros</li><li>Contacto</li></ul>
        </div>
      </div>
      <div className="bg-teal-900 text-center p-4 text-sm">© 2025 Iglú. Plataforma de videoconferencias.</div>
    </footer>
  )
}
