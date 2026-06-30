import { useState } from "react";
import FormularioLogin from "./components/FormularioLogin";
import Inicio from "./pages/Inicio";

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = (token) => {
    const payload = parseJwt(token);
    const name =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "";
    const rol =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
    setUserData({ name, rol });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserData(null);
  };

  const handlePerfilUpdated = (newToken) => {
    localStorage.setItem("token", newToken);
    const payload = parseJwt(newToken);
    const name =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "";
    const rol =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
    setUserData({ name, rol });
  };

  return (
    <>
      {isLoggedIn ? (
        <Inicio onLogout={handleLogout} userData={userData} onPerfilUpdated={handlePerfilUpdated} />
      ) : (
        <FormularioLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
