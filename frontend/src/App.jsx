import { useState } from "react";
import FormularioLogin from "./components/FormularioLogin"; 
import Inicio from "./pages/Inicio"; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (
        <Inicio />
      ) : (
        /* Quitamos las clases de aquí para que no peleen con el componente */
        <FormularioLogin onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

export default App;
