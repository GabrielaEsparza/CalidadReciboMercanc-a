export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Tarjeta En Curso */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">En Curso</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">2</p>
          <p className="text-xs text-gray-400 mt-1">Recepciones activas ahora</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 text-xl font-bold">
          ↻
        </div>
      </div>

      {/* Tarjeta Terminadas Hoy */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">Terminadas Hoy</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">1</p>
          <p className="text-xs text-gray-400 mt-1">Descargas completadas</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-lg">
          ✓
        </div>
      </div>

      {/* Tarjeta Incidencias */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">Incidencias</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">2</p>
          <p className="text-xs text-gray-400 mt-1">Registradas en total</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-lg">
          ⚠
        </div>
      </div>
    </div>
  );
}
