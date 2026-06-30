import { useState } from 'react';
import { buscarContenedor } from '../../services/arribos';

export default function BuscarContenedor({ alRegresar, onContenedorEncontrado }) {
  const [idContenedor, setIdContenedor] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarBusqueda = async (e) => {
    e.preventDefault();
    if (!idContenedor.trim()) return;
    setCargando(true);
    setError('');
    try {
      const data = await buscarContenedor(idContenedor.trim());
      onContenedorEncontrado(data);
    } catch {
      setError('Contenedor no encontrado. Verifique el ID e intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="p-8 max-w-[1400px] w-full mx-auto space-y-6 text-gray-800">

      {/* ENCABEZADO */}
      <div className="flex items-center gap-4">
        <button
          onClick={alRegresar}
          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Entrada de Importación</h1>
          <p className="text-xs text-gray-400 mt-0.5">Recepción y registro de mercancía importada</p>
        </div>
      </div>

      {/* STEPPER */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between text-xs font-semibold text-gray-400 max-w-4xl">
        <div className="flex items-center gap-2 text-blue-600">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">🚚</span>
          <span>Contenedor</span>
        </div>
        <div className="h-px bg-gray-200 flex-1 mx-4"></div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">👥</span>
          <span>Equipo</span>
        </div>
        <div className="h-px bg-gray-200 flex-1 mx-4"></div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">📦</span>
          <span>Producto SKU</span>
        </div>
        <div className="h-px bg-gray-200 flex-1 mx-4"></div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">#</span>
          <span>Números de Serie</span>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="text-blue-600 text-sm">🚚</span>
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Datos del Contenedor</h2>
          </div>

          <form onSubmit={manejarBusqueda} className="p-6 space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              ID del Contenedor
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1 border-2 border-blue-500 rounded-xl bg-white px-4 py-3 flex items-center gap-3 shadow-inner">
                <span className="text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={idContenedor}
                  onChange={(e) => setIdContenedor(e.target.value)}
                  placeholder="Escanee o ingrese el ID del contenedor..."
                  className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-300 font-medium"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold px-6 rounded-xl text-xs transition-colors shadow-sm tracking-wide"
              >
                {cargando ? '...' : 'Buscar'}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[220px]">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 text-2xl mb-4">
              📦
            </div>
            <h3 className="text-xs font-bold text-gray-400 tracking-wide">Ingrese un contenedor</h3>
            <p className="text-[11px] text-gray-300 mt-1 max-w-[180px]">La imagen del producto aparecerá aquí</p>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-5 text-left shadow-sm">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
              💡 Tip de escaneo
            </h4>
            <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
              El lector USB envía los datos como teclado. Asegúrese de que el campo esté enfocado (<span className="text-blue-600 font-bold">borde azul</span>) antes de escanear.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
