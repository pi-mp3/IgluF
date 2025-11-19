import React from 'react'
import MeetingExplore from '../widgets/MeetingExplore'
export default function Home(){
  return (
    <div className="max-w-6xl mx-auto p-6">
      <section className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-3xl font-semibold">Videoconferencias que conectan equipos</h1>
          <p className="mt-4 text-lg">Iglú es la plataforma de videoconferencias en tiempo real con chat, audio y video.</p>
          <div className="mt-6 flex gap-4">
            <button className="btn-primary">Comenzar Gratis</button>
            <button className="btn-outline">Iniciar Sesión</button>
          </div>
        </div>
        <div className="p-6 bg-white rounded shadow">
          <img src="/logo.png" alt="Iglú Logo" className="mx-auto" />
        </div>
      </section>
      <section className="mt-12">
        <h2 className="text-center text-xl font-medium">Mapa del Sitio</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="card">Autenticación<ul className="mt-2 list-disc ml-5"><li>Registro</li><li>Iniciar sesión</li></ul></div>
          <div className="card">Reuniones<ul className="mt-2 list-disc ml-5"><li>Crear reunión</li></ul></div>
          <div className="card">Perfil<ul className="mt-2 list-disc ml-5"><li>Ver perfil</li></ul></div>
        </div>
      </section>
      <section className="mt-12">
        <MeetingExplore />
      </section>
    </div>
  )
}
