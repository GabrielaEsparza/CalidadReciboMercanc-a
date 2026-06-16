import { useState } from "react";

export default function RecepcionesTable() {
  // 1. Datos Mock (Simulados) fijos aquí adentro como habías pedido
  const datosMock = [
    { rec: "REC-2024-001", oc: "OC-4521", prov: "Tech Import MX S.A. de C.V.", eta: "2024-12-15", cont: "TCXU3456789", skus: 5, estado: "En Curso", accion: "Iniciar" },
    { rec: "REC-2024-002", oc: "OC-4455", prov: "Global Electronics CDMX", eta: "2024-12-14", cont: "MSCU2198443", skus: 2, estado: "En Curso", accion: "Continuar" },
    { rec: "REC-2024-003", oc: "OC-4380", prov: "Distribuidora Norte S.A.", eta: "2024-12-13", cont: "HLXU871902", skus: 1, estado: "Terminado", accion: "Historial" },
  ];

  // 2. Estados para controlar los filtros en la pantalla
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");

  // 3. Lógica para filtrar los datos en tiempo real
  const datosFiltrados = datosMock.filter((row) => {
    // Filtrar por texto (Recepción o OC)
    const cumpleBusqueda =
      row.rec.toLowerCase().includes(busqueda.toLowerCase()) ||
      row.oc.toLowerCase().includes(busqueda.toLowerCase());

    // Filtrar por Estado select
    const cumpleEstado = filtroEstado === "" || row.estado === filtroEstado;

    // Filtrar por Proveedor select
    const cumpleProveedor = filtroProveedor === "" || row.prov.includes(filtroProveedor);

    return cumpleBusqueda && cumpleEstado && cumpleProveedor;
  });

  // Función rápida para limpiar todos los filtros con el botón de reiniciar
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("");
    setFiltroProveedor("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-800">
      
      {/* SECCIÓN DE ENCABEZADO Y FILTROS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-gray-50 pb-4">
        {/* Título dinámico con el contador filtrado */}
        <h2 className="text-base font-bold text-gray-800 shrink-0">
          Recepciones ({datosFiltrados.length})
        </h2>

        {/* CONTENEDOR DE FILTROS ALINEADO A LA DERECHA */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          
          {/* 1. Input Buscador */}
          <div className="relative w-full sm:w-52">
            <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por recepción, OC..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* 2. Select Estado */}
          <select 
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="En Curso">En Curso</option>
            <option value="Terminado">Terminado</option>
          </select>

          {/* 3. Select Proveedores */}
          <select 
            value={filtroProveedor}
            onChange={(e) => setFiltroProveedor(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[160px] truncate"
          >
            <option value="">Todos los proveedores</option>
            <option value="Tech Import">Tech Import MX</option>
            <option value="Global Electronics">Global Electronics</option>
            <option value="Distribuidora Norte">Distribuidora Norte</option>
          </select>

          {/* 4. Botón Reset */}
          <button 
            onClick={limpiarFiltros}
            title="Limpiar filtros"
            className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-500 transition-colors"
          >
            🔄
          </button>

        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase text-[11px] tracking-wider font-semibold">
              <th className="py-3">Recepción</th>
              <th className="py-3">OC</th>
              <th className="py-3">Proveedor</th>
              <th className="py-3">ETA</th>
              <th className="py-3">Contenedor</th>
              <th className="py-3">SKUs</th>
              <th className="py-3">Estado</th>
              <th className="py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y divide-gray-50">
            {datosFiltrados.length > 0 ? (
              datosFiltrados.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 font-bold text-gray-800">{row.rec}</td>
                  <td className="py-4 text-blue-600 font-medium">{row.oc}</td>
                  <td className="py-4 text-gray-500 text-xs">{row.prov}</td>
                  <td className="py-4 text-gray-400 text-xs">{row.eta}</td>
                  <td className="py-4 text-gray-400 font-mono text-xs">{row.cont}</td>
                  <td className="py-4 text-xs">{row.skus}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      row.estado === "En Curso" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.estado === "En Curso" ? "bg-green-500" : "bg-blue-500"}`}></span>
                      {row.estado}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-sm ${
                      row.accion === "Historial" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}>
                      {row.accion}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-400 text-xs font-medium">
                  Ningún registro coincide con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
