import { useState, useEffect } from "react";
import { buscarContenedor } from "../../services/arribos";
import { generarPdfRecepcion } from "../../utils/generarPdfRecepcion";

export default function RecepcionDetalleModal({ recepcion, onClose }) {
  const [arriboDetalle, setArriboDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorArribo, setErrorArribo] = useState('');

  useEffect(() => {
    if (!recepcion) return;
    setCargando(true);
    setErrorArribo('');
    setArriboDetalle(null);
    buscarContenedor(recepcion.contenedor)
      .then(data => setArriboDetalle(data))
      .catch(() => setErrorArribo('No se pudieron cargar los detalles del arribo.'))
      .finally(() => setCargando(false));
  }, [recepcion]);

  if (!recepcion) return null;

  const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const totalEsperado = arriboDetalle?.detalles?.reduce((sum, d) => sum + d.cantidad, 0) ?? 0;
  const tieneIncidencias = recepcion.totalIncidencias > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-black text-gray-800">
              REC-{String(recepcion.id).padStart(4, '0')}
            </span>
            <span className="font-mono text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
              {recepcion.contenedor}
            </span>
            {tieneIncidencias ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                {recepcion.totalIncidencias} incidencia{recepcion.totalIncidencias > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Sin incidencias
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none font-light shrink-0 ml-3"
          >
            ×
          </button>
        </div>

        {/* BODY — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* RESUMEN */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Operador</p>
              <p className="text-sm font-bold text-gray-800">{recepcion.operador}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Llegada</p>
              <p className="text-xs font-medium text-gray-700">{formatFecha(recepcion.fechaLlegada)}</p>
            </div>
            <div className={`rounded-xl p-3 border ${tieneIncidencias ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
              <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${tieneIncidencias ? 'text-orange-400' : 'text-green-400'}`}>
                Total incidencias
              </p>
              <p className={`text-lg font-black ${tieneIncidencias ? 'text-orange-700' : 'text-green-700'}`}>
                {recepcion.totalIncidencias}
              </p>
            </div>
          </div>

          {/* DETALLES DEL ARRIBO */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
              Detalle del Arribo
              {!cargando && arriboDetalle && (
                <span className="text-gray-300 font-normal normal-case tracking-normal">
                  — {arriboDetalle.detalles.length} línea{arriboDetalle.detalles.length !== 1 ? 's' : ''} · {totalEsperado.toLocaleString()} unidades esperadas
                </span>
              )}
            </h3>

            {cargando && (
              <p className="text-xs text-gray-400 py-3 text-center">Cargando detalles del arribo...</p>
            )}
            {errorArribo && (
              <p className="text-xs text-red-400 py-3 text-center">{errorArribo}</p>
            )}
            {!cargando && arriboDetalle && arriboDetalle.detalles.length > 0 && (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-2.5 px-4 text-left">Orden de Compra</th>
                      <th className="py-2.5 px-4 text-left">SKU</th>
                      <th className="py-2.5 px-4 text-right">Cant. Esperada</th>
                      <th className="py-2.5 px-4 text-right">Cant. Recibida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {arriboDetalle.detalles.map((d, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-gray-400">{d.ordenCompra || '—'}</td>
                        <td className="py-2.5 px-4 font-bold text-gray-800">{d.codigo}</td>
                        <td className="py-2.5 px-4 text-right text-gray-600 font-medium">{d.cantidad.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-gray-300 font-medium">—</td>
                      </tr>
                    ))}
                  </tbody>
                  {arriboDetalle.detalles.length > 1 && (
                    <tfoot>
                      <tr className="bg-gray-50 border-t border-gray-200">
                        <td colSpan="2" className="py-2 px-4 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                          Total
                        </td>
                        <td className="py-2 px-4 text-right text-sm font-black text-gray-700">
                          {totalEsperado.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-sm text-gray-300">—</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
            {!cargando && arriboDetalle && arriboDetalle.detalles.length === 0 && (
              <p className="text-xs text-gray-400 py-2 text-center">Sin detalles de arribo registrados.</p>
            )}
          </div>

          {/* INCIDENCIAS */}
          {tieneIncidencias && (
            <div>
              <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block"></span>
                Incidencias ({recepcion.totalIncidencias})
              </h3>
              <div className="space-y-2">
                {recepcion.incidencias.map((inc, i) => (
                  <div key={inc.id ?? i} className="bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="text-orange-400 text-sm mt-0.5 shrink-0">⚠️</span>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-gray-800">{inc.skuProducto}</span>
                          {inc.numeroSerie && (
                            <span className="font-mono text-[10px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                              Serie: {inc.numeroSerie}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                            {inc.tipoIncidencia}
                          </span>
                        </div>
                        {inc.observacion && (
                          <p className="text-[11px] text-gray-500 leading-relaxed">{inc.observacion}</p>
                        )}
                        {inc.evidenciaFoto && (
                          <img
                            src={inc.evidenciaFoto}
                            alt="Evidencia fotográfica"
                            className="mt-2 rounded-lg max-h-48 object-cover border border-orange-100 cursor-pointer"
                            onClick={() => window.open(inc.evidenciaFoto, '_blank')}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin incidencias banner */}
          {!tieneIncidencias && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <span className="text-green-500 text-sm">✓</span>
              <p className="text-xs text-green-700 font-medium">Recepción sin incidencias — todo OK.</p>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center shrink-0">
          <button
            onClick={() => generarPdfRecepcion(recepcion, arriboDetalle)}
            disabled={cargando}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ↓ Descargar PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
