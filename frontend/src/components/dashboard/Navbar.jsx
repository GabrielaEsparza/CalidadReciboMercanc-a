function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-gray-400">ACTECK RyC</span>
        <span className="text-gray-300">&gt;</span>
        <span className="text-gray-700 font-semibold">Dashboard</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Barra de búsqueda interna */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar recepción, OC, proveedor..."
            className="w-64 pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Icono de Campana de Notificaciones */}
        <button className="relative p-1 text-gray-400 hover:text-gray-600">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
            CM
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800 leading-tight">Carlos Mendoza</p>
            <p className="text-[10px] text-gray-400 leading-tight">Supervisor</p>
          </div>
        </div>
      </div>
    </header>
  );
}


export default Navbar;