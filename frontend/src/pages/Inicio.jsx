import { useEffect, useState } from 'react';
import SideBar from '../components/dashboard/SideBar';
import Navbar from '../components/dashboard/Navbar';
import StatsCards from '../components/dashboard/StatsCards';
import RecepcionesTable from '../components/dashboard/RecepcionesTable';
import BuscarContenedor from '../components/dashboard/BuscarContenedor'; // Importas el nuevo componente
import { getRecepciones } from '../services/recepciones';

function Inicio() {
  const [recepciones, setRecepciones] = useState([]);
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  
  // 1. AGREGA ESTE ESTADO: Controla si mostramos el Dashboard o el Formulario
  const [verNuevaRecepcion, setVerNuevaRecepcion] = useState(false);

  useEffect(() => {
    getRecepciones()
      .then(data => setRecepciones(data))
      .catch(err => alert("No se pudieron cargar los datos de la API"));
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <SideBar colapsado={sidebarColapsado} setColapsado={setSidebarColapsado} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />

        {/* 2. CONDICIONAL DE RENDERIZADO */}
        {verNuevaRecepcion ? (
          // Si es verdadero, mostramos la pantalla de tu imagen y le pasamos la función para regresar
          <BuscarContenedor alRegresar={() => setVerNuevaRecepcion(false)} />
        ) : (
          // Si es falso, mostramos tu Dashboard original
          <main className="p-8 max-w-[1400px] w-full mx-auto space-y-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Dashboard de Recepciones</h1>
              <p className="text-xs text-gray-400 mt-0.5">Control en tiempo real de importaciones — martes, 16 de junio de 2026</p>
            </div>

            <StatsCards />

            {/* 3. AGREGAMOS EL ONCLICK AL BOTÓN AZUL */}
            <button 
              onClick={() => setVerNuevaRecepcion(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm tracking-wide"
            >
              + Nueva Recepción
            </button>

            <RecepcionesTable />
          </main>
        )}
      </div>
    </div>
  );
}

export default Inicio;
