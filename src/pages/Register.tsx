import React, {useState} from 'react'
export default function Register(){
  const [form, setForm] = useState({name:'', email:'', password:''})
  function onChange(e:any){ setForm({...form, [e.target.name]: e.target.value})}
  async function submit(e:any){ e.preventDefault(); /* call fetch to backend */ }
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center">Crea tu cuenta</h2>
      <form onSubmit={submit} className="mt-6 bg-white p-6 rounded shadow">
        <label className="block">Nombre completo<input name="name" onChange={onChange} className="mt-2 input" /></label>
        <label className="block mt-4">Correo electrónico<input name="email" onChange={onChange} className="mt-2 input" /></label>
        <label className="block mt-4">Contraseña<input type="password" name="password" onChange={onChange} className="mt-2 input" /></label>
        <div className="mt-6"><button className="btn-primary w-full">Registrarse</button></div>
      </form>
    </div>
  )
}
