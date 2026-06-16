import { useState } from 'react';

function Sidebar({ colapsado, setColapsado }) {
  // Estado para saber qué pestaña está seleccionada
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🎛️' },
    { id: 'reportes', label: 'Reportes', icon: '📊' }
  ];

  return (
    /* 
      2. MODIFICA EL CLASNAME DEL ASIDE: 
      Usamos comillas invertidas para que si "colapsado" es true, mida w-16, y si es false, mida w-60.
    */
    <aside className={`h-screen bg-[#0d1b2a] text-slate-300 flex flex-col justify-between relative transition-all duration-300 ${
      colapsado ? 'w-16' : 'w-60'
    }`}>
      
      <div>
        {/* logo */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/50 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md shrink-0">
            A
          </div>
          {/* Ocultamos el texto si el menú está colapsado */}
          {!colapsado && (
            <div>
              <h2 className="text-xs font-bold text-white tracking-wider">ACTECK</h2>
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-tight">Recepción & Calidad</p>
            </div>
          )}
        </div>

        <nav className="mt-6 px-2 space-y-1 overflow-hidden">
          {menuItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-lg transition-all relative whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                }`}
              >
                {isSelected && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-md"></span>
                )}
                
                <span className="text-base shrink-0">{item.icon}</span>
                
                {/* Ocultamos las letras de las pestañas si está colapsado */}
                {!colapsado && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* onClick para colapsar */}
      <button 
        onClick={() => setColapsado(!colapsado)}
        className="absolute top-1/2 -right-3 w-6 h-6 bg-[#0d1b2a] border border-slate-800 rounded-full flex items-center justify-center text-[10px] text-slate-400 hover:text-white shadow-sm z-10 transition-transform duration-300"
      >
        {/* La flecha cambia de lado automáticamente */}
        {colapsado ? '›' : '‹'}
      </button>

    </aside>
  );
}

export default Sidebar;
