export default function StatsCards({ recepciones = [] }) {
  const hoy = new Date();
  const esHoy = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    return (
      d.getFullYear() === hoy.getFullYear() &&
      d.getMonth()    === hoy.getMonth() &&
      d.getDate()     === hoy.getDate()
    );
  };

  const totalRecepciones = recepciones.length;
  const terminadasHoy    = recepciones.filter(r => esHoy(r.fechaLlegada)).length;
  const incidenciasHoy = recepciones
    .filter(r => esHoy(r.fechaLlegada))
    .reduce((sum, r) => sum + r.totalIncidencias, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

      {/* Total Recepciones */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">Total Recepciones</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalRecepciones}</p>
          <p className="text-xs text-gray-400 mt-1">Recepciones registradas</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 text-xl font-bold">
          ↻
        </div>
      </div>

      {/* Terminadas Hoy */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">Terminadas Hoy</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{terminadasHoy}</p>
          <p className="text-xs text-gray-400 mt-1">Recepciones del día</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-lg">
          ✓
        </div>
      </div>

      {/* Incidencias */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase">Incidencias</p>
          <p className={`text-3xl font-bold mt-1 ${incidenciasHoy > 0 ? 'text-orange-500' : 'text-gray-800'}`}>
            {incidenciasHoy}
          </p>
          <p className="text-xs text-gray-400 mt-1">Registradas hoy</p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${incidenciasHoy > 0 ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-400'}`}>
          ⚠
        </div>
      </div>

    </div>
  );
}
