import { useEffect, useState } from 'react';
import SideBar from '../components/dashboard/SideBar';
import Navbar from '../components/dashboard/Navbar';
import StatsCards from '../components/dashboard/StatsCards';
import RecepcionesTable from '../components/dashboard/RecepcionesTable';
import BuscarContenedor from '../components/dashboard/BuscarContenedor';
import EscaneoContenedor from '../components/dashboard/EscaneoContenedor';
import { getRecepciones } from '../services/recepciones';

// pasos: 'dashboard' | 'buscar' | 'escaneo'
function Inicio({ onLogout, userData, onPerfilUpdated }) {
  const [recepciones, setRecepciones] = useState([]);
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [paso, setPaso] = useState('dashboard');
  const [contenedorActual, setContenedorActual] = useState(null);

  useEffect(() => {
    getRecepciones()
      .then(data => setRecepciones(data))
      .catch(() => {});
  }, []);

  const irADashboard = () => {
    setPaso('dashboard');
    setContenedorActual(null);
  };

  const alContenedorEncontrado = (data) => {
    setContenedorActual(data);
    setPaso('escaneo');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <SideBar colapsado={sidebarColapsado} setColapsado={setSidebarColapsado} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar onLogout={onLogout} userData={userData} onPerfilUpdated={onPerfilUpdated} />

        {paso === 'dashboard' && (
          <main className="p-8 max-w-[1400px] w-full mx-auto space-y-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Dashboard de Recepciones</h1>
              <p className="text-xs text-gray-400 mt-0.5">Control en tiempo real de importaciones — {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <StatsCards recepciones={recepciones} />
            <button
              onClick={() => setPaso('buscar')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm tracking-wide"
            >
              + Nueva Recepción
            </button>
            <RecepcionesTable />
          </main>
        )}

        {paso === 'buscar' && (
          <BuscarContenedor
            alRegresar={irADashboard}
            onContenedorEncontrado={alContenedorEncontrado}
          />
        )}

        {paso === 'escaneo' && contenedorActual && (
          <EscaneoContenedor
            contenedor={contenedorActual}
            alRegresar={irADashboard}
            alCambiarContenedor={() => setPaso('buscar')}
          />
        )}
      </div>
    </div>
  );
}

export default Inicio;
