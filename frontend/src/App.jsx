import { useState } from "react";
import FormularioLogin from "./components/FormlarioLogin";
import Inicio from "./pages/Inicio"; // Asegúrate de que la ruta a tu página de inicio sea correcta

function App() {
  // Guardamos un estado para saber si el usuario inició sesión
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn ? (
        // Si ya inició sesión, mostramos la página de Inicio
        <Inicio />
      ) : (
        // Si no, lo dejamos en el formulario de Login y le pasamos la función para cambiar de estado
        <FormularioLogin onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
