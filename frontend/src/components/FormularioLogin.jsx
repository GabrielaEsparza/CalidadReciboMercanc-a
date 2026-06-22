import { useState } from "react";
import { autenticar } from '../services/authentication'; // Ajusta la ruta a donde guardaste el 'export const autenticar'


  // 1. Asegúrate de poner "onLoginSuccess" aquí arriba entre las llaves del componente:
function FormularioLogin({ onLoginSuccess }) { 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. Añadimos 'async' para poder esperar la respuesta de la red
  const iniciarSesion = async (e) => {
    e.preventDefault();
    
    try {
      const datosAutenticacion = await autenticar(username, password);
      
      if (datosAutenticacion && datosAutenticacion.exito) {
        
        localStorage.setItem("token", datosAutenticacion.token);
        
        onLoginSuccess(); 
      } else {
        console.error(datosAutenticacion.mensaje || "Usuario o contraseña incorrectos");
      }

    } catch (error) {
      console.error("Fallo el inicio de sesión:", error);
      console.error("Usuario o contraseña incorrectos o error de servidor");
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#0d1b2e" }}>

      {/* Card */}
      <div className="w-80 rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#112240" }}>

        {/* Barra de acento superior */}
        <div className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #1e6fd9, #4fa3ff)" }} />

        <div className="px-8 py-8 flex flex-col items-center gap-4">

          {/* Logo */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            A
          </div>

          {/* Marca */}
          <div className="text-center">
            <h1 className="text-white text-xl font-extrabold tracking-widest">ACTECK</h1>
            <p className="text-blue-400 text-xs font-semibold tracking-widest mt-0.5">
              RECEPCIÓN & CALIDAD
            </p>
            <span className="mt-2 inline-block text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-700/50"
              style={{ backgroundColor: "rgba(30, 58, 138, 0.4)" }}>
              Sistema de Gestión de Almacén v2.4.1
            </span>
          </div>

          {/* Formulario */}
          <form onSubmit={iniciarSesion} className="w-full mt-2 space-y-4">

            {/* Usuario */}
            <div>
              <label className="text-xs font-semibold tracking-widest block mb-1"
                style={{ color: "#8badc7" }}>
                USUARIO
              </label>
              <div className="rounded-xl flex items-center px-3 py-3 gap-2 border"
                style={{ backgroundColor: "#1a2f4a", borderColor: "#243b55" }}>
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nombre de usuario"
                  className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white-950"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="text-xs font-semibold tracking-widest block mb-1"
                style={{ color: "#8badc7" }}>
                CONTRASEÑA
              </label>
              <div className="rounded-xl flex items-center px-3 py-3 gap-2 border"
                style={{ backgroundColor: "#1a2f4a", borderColor: "#243b55" }}>
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-white text-sm w-full outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  <svg className="w-4 h-4 text-blue-400" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Botón */}
            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Iniciar Sesión
            </button>

           
          </form>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs mt-6" style={{ color: "#2a4a6b" }}>
        © 2024 ACTECK — Sistema de Control de Calidad v2.4.1
      </p>
    </div>
  );
}

export default FormularioLogin;