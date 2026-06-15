import { useState } from 'react';

function Sidebar() {
  // Estado para saber qué pestaña está seleccionada
  const [activeTab, setActiveTab] = useState('recibo');

  // Lista de opciones del menú (puedes cambiar los nombres después)
  const menuItems = [
    { id: 'inicio', label: 'Inicio / Panel', icon: '📊' },
    { id: 'recibo', label: 'Recibo de Mercancía', icon: '📦' },
    { id: 'calidad', label: 'Control de Calidad', icon: '✅' },
    { id: 'proveedores', label: 'Proveedores', icon: '🚚' },
    { id: 'config', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800">
      
      {/* SECCIÓN SUPERIOR: Logo y Usuario */}
      <div>
        {/* Encabezado del Sistema */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-wide">📦 Sistema Recibo</h2>
          <p className="text-xs text-slate-400 mt-1">Módulo de Calidad</p>
        </div>

        {/* Datos del Operador / Usuario */}
        <div className="p-4 mx-3 my-4 bg-slate-800/50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
            G
          </div>
          <div>
            <p className="text-sm font-medium text-white">Gabriela E.</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 block"></span> En línea
            </p>
          </div>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* SECCIÓN INFERIOR: Botón de Salir */}
      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
          <span>🚪</span>
          Cerrar Sesión
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
