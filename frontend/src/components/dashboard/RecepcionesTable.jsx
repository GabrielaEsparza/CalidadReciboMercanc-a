import { useState, useEffect } from "react";
import { getRecepciones } from "../../services/recepciones";
import { buscarContenedor } from "../../services/arribos";
import RecepcionDetalleModal from "./RecepcionDetalleModal";
import { generarPdfReporteDiario } from "../../utils/generarPdfReporteDiario";

export default function RecepcionesTable() {
  const [recepciones, setRecepciones] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState('');
  const [busqueda, setBusqueda]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalRecepcion, setModalRecepcion] = useState(null);
  const [generandoReporte, setGenerandoReporte] = useState(false);

  const handleReporteDiario = async () => {
    setGenerandoReporte(true);
    try {
      const hoy = new Date();
      const esHoy = (iso) => {
        if (!iso) return false;
        const d = new Date(iso);
        return d.getFullYear() === hoy.getFullYear() &&
               d.getMonth()    === hoy.getMonth() &&
               d.getDate()     === hoy.getDate();
      };
      const recepcionesHoy = recepciones.filter(r => esHoy(r.fechaLlegada));
      const arriboDetallesMap = {};
      await Promise.all(
        recepcionesHoy.map(async r => {
          try {
            arriboDetallesMap[r.contenedor] = await buscarContenedor(r.contenedor);
          } catch {
            arriboDetallesMap[r.contenedor] = null;
          }
        })
      );
      generarPdfReporteDiario(recepciones, arriboDetallesMap, hoy);
    } finally {
      setGenerandoReporte(false);
    }
  };

  useEffect(() => {
    getRecepciones()
      .then(data => setRecepciones(data))
      .catch(() => setError('No se pudieron cargar las recepciones.'))
      .finally(() => setCargando(false));
  }, []);

  const datosFiltrados = recepciones.filter(r => {
    const cumpleBusqueda =
      r.contenedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(r.id).includes(busqueda) ||
      r.operador?.toLowerCase().includes(busqueda.toLowerCase());

    const sinIncidencias = r.totalIncidencias === 0;
    const estadoRow = sinIncidencias ? 'OK' : 'Incidencias';
    const cumpleEstado = filtroEstado === '' || estadoRow === filtroEstado;

    return cumpleBusqueda && cumpleEstado;
  });

  const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-800">

      {/* ENCABEZADO Y FILTROS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-gray-50 pb-4">
        <h2 className="text-base font-bold text-gray-800 shrink-0">
          Historial de Recepciones ({datosFiltrados.length})
        </h2>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="relative w-full sm:w-52">
            <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Contenedor, operador, ID..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="OK">Sin incidencias</option>
            <option value="Incidencias">Con incidencias</option>
          </select>
          <button
            onClick={() => { setBusqueda(''); setFiltroEstado(''); }}
            title="Limpiar filtros"
            className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-500 transition-colors"
          >
            🔄
          </button>
          <button
            onClick={handleReporteDiario}
            disabled={recepciones.length === 0 || generandoReporte}
            title="Reporte diario PDF"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {generandoReporte ? '⏳ Generando...' : '↓ Reporte del día'}
          </button>
        </div>
      </div>

      {/* ESTADOS */}
      {cargando && <p className="text-xs text-gray-400 py-4 text-center">Cargando recepciones...</p>}
      {error    && <p className="text-xs text-red-500 py-4 text-center">{error}</p>}

      {/* TABLA */}
      {!cargando && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-3">ID</th>
                <th className="py-3">Contenedor</th>
                <th className="py-3">Operador</th>
                <th className="py-3">Fecha</th>
                <th className="py-3">Incidencias</th>
                <th className="py-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y divide-gray-50">
              {datosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 text-xs font-medium">
                    {recepciones.length === 0 ? 'Aún no hay recepciones registradas.' : 'Ningún registro coincide con los filtros.'}
                  </td>
                </tr>
              ) : (
                datosFiltrados.map(r => (
                  <tr
                    key={r.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => setModalRecepcion(r)}
                  >
                    <td className="py-4 font-bold text-gray-800">
                      REC-{String(r.id).padStart(4, '0')}
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-600">{r.contenedor}</td>
                    <td className="py-4 text-gray-500 text-xs">{r.operador}</td>
                    <td className="py-4 text-gray-400 text-xs">{formatFecha(r.fechaLlegada)}</td>
                    <td className="py-4 text-xs font-medium">
                      {r.totalIncidencias > 0
                        ? <span className="text-orange-600">{r.totalIncidencias} incidencia{r.totalIncidencias > 1 ? 's' : ''}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.totalIncidencias === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> ⚠️ Incidencias
                          </span>
                        )}
                        <span className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalRecepcion && (
        <RecepcionDetalleModal
          recepcion={modalRecepcion}
          onClose={() => setModalRecepcion(null)}
        />
      )}
    </div>
  );
}
