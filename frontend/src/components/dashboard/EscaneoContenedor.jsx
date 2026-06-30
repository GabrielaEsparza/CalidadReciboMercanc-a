import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { buscarProductoPorSku } from '../../services/productos';
import { getOperadores } from '../../services/operadores';
import { crearRecepcion } from '../../services/recepciones';

// ─── UTILS ───────────────────────────────────────────────────────────────────

function comprimirRangos(series) {
  if (!series.length) return [];
  const items = series.map(s => {
    const n = Number(s);
    return { original: s, num: Number.isFinite(n) && s.trim() !== '' ? n : null };
  });
  const allNumeric = items.every(x => x.num !== null);
  if (!allNumeric) return series;
  items.sort((a, b) => a.num - b.num);
  const result = [];
  let i = 0;
  while (i < items.length) {
    let j = i + 1;
    while (j < items.length && items[j].num === items[j - 1].num + 1) j++;
    const len = j - i;
    if (len >= 3) {
      result.push(`${items[i].original} to ${items[j - 1].original}`);
    } else {
      for (let k = i; k < j; k++) result.push(items[k].original);
    }
    i = j;
  }
  return result;
}

function generarPdfPallet(grupos, qrDataUrl) {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 18;
  const BLUE   = [37, 99, 235];
  const GRAY   = [75, 85, 99];
  const LGRAY  = [243, 244, 246];
  let y = margin;

  // Header bar
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Pallet', margin, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    pageW - margin, 14, { align: 'right' }
  );
  y = 30;

  // QR grande centrado
  const qrSize = 90;
  if (qrDataUrl) {
    const qrX = (pageW - qrSize) / 2;
    doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize);
  }
  y += qrSize + 6;

  // Resumen SKUs bajo el QR
  const totalUnidades = grupos.reduce((s, g) => s + g.series.length, 0);
  doc.setTextColor(...BLUE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${grupos.length} SKU${grupos.length > 1 ? 's' : ''} · ${totalUnidades} unidades`, pageW / 2, y, { align: 'center' });
  y += 6;

  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  grupos.forEach(g => {
    doc.text(`• ${g.sku} (${g.series.length} uds)`, pageW / 2, y, { align: 'center' });
    y += 5;
  });
  y += 4;

  // Separador
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // Tablas por SKU
  for (const grupo of grupos) {
    const rangos = comprimirRangos(grupo.series);

    doc.setTextColor(...BLUE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`SKU: ${grupo.sku}`, margin, y);
    doc.setTextColor(...GRAY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${grupo.series.length} unidad${grupo.series.length !== 1 ? 'es' : ''}`, margin + 38, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Número de Serie / Rango']],
      body: rangos.map((r, i) => [i + 1, r]),
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [55, 65, 81] },
      headStyles: { fillColor: BLUE, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 10, halign: 'right', textColor: [156, 163, 175] } },
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // Footer
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Calidad — Reporte de Pallet', margin, pageH - 8);
  doc.text(new Date().toISOString().slice(0, 10), pageW - margin, pageH - 8, { align: 'right' });

  const skusLabel = grupos.map(g => g.sku).join('_');
  doc.save(`Pallet_${skusLabel}_${Date.now()}.pdf`);
}

// ─── STEPPER ────────────────────────────────────────────────────────────────
function StepperContenedor({ paso }) {
  const pasos = [
    { id: 1, label: 'Contenedor',       icon: '🚚' },
    { id: 2, label: 'Equipo',           icon: '👥' },
    { id: 3, label: 'Producto SKU',     icon: '📦' },
    { id: 4, label: 'Números de Serie', icon: '#'  },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between text-xs font-semibold max-w-4xl">
      {pasos.map((p, i) => {
        const done   = p.id < paso;
        const active = p.id === paso;
        return (
          <div key={p.id} className="flex items-center gap-1 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {done ? '✓' : p.icon}
              </span>
              <span className={done ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-400'}>
                {p.label}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <div className={`h-px flex-1 mx-3 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SELECCIÓN DE EQUIPO ─────────────────────────────────────────────────────
function SeleccionEquipo({ onOperadorSeleccionado }) {
  const [operadores, setOperadores] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    getOperadores()
      .then(setOperadores)
      .catch(() => setError('No se pudieron cargar los operadores.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border-2 border-blue-500 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">👥</span>
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Seleccionar Operador</h2>
      </div>
      <div className="p-6">
        {cargando && <p className="text-sm text-gray-400">Cargando operadores...</p>}
        {error    && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {!cargando && !error && operadores.length === 0 && (
          <p className="text-xs text-amber-600 font-medium">No hay operadores registrados en el sistema.</p>
        )}
        <div className="grid grid-cols-2 gap-3 mt-2">
          {operadores.map(op => (
            <button
              key={op.id}
              onClick={() => onOperadorSeleccionado(op)}
              className="border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl p-4 text-left transition-colors"
            >
              <p className="text-sm font-bold text-gray-800">{op.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{op.rol}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MODAL INCIDENCIA ────────────────────────────────────────────────────────
function ModalIncidencia({ sku, tipoForzado, comentarioInicial, onCerrar, onConfirmar }) {
  const [tipo, setTipo]               = useState(tipoForzado || '');
  const [descripcion, setDesc]        = useState(comentarioInicial || '');
  const [numeroSerie, setNumeroSerie] = useState('');

  const tipos = [
    'Producto dañado',
    'Cantidad incorrecta',
    'SKU no coincide con etiqueta',
    'Número de serie ilegible',
    'Producto faltante',
    'SKU no detectado',
    'Otro',
  ];

  const handleConfirmar = () => {
    if (!tipo) return;
    onConfirmar({ sku, tipo, descripcion, numeroSerie: numeroSerie.trim() || null });
    onCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-lg">⚠️</span>
            <h2 className="text-sm font-bold text-white">Reportar Incidencia</h2>
          </div>
          {!tipoForzado && (
            <button onClick={onCerrar} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
          )}
        </div>

        <div className="px-6 pt-5 pb-2">
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">SKU</span>
            <span className="text-sm font-bold text-gray-800">{sku}</span>
            {tipoForzado && (
              <span className="ml-auto text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                Auto-detectado
              </span>
            )}
          </div>

          {!tipoForzado && (
            <div className="space-y-1.5 mb-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Número de Serie (opcional)
              </label>
              <input
                type="text"
                value={numeroSerie}
                onChange={e => setNumeroSerie(e.target.value)}
                placeholder="Ingrese o escanee el número de serie..."
                className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none"
              />
            </div>
          )}

          <div className="space-y-1.5 mb-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Tipo de incidencia *
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              disabled={!!tipoForzado}
              className="w-full border-2 border-gray-200 focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-500 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none bg-white"
            >
              <option value="">Seleccione un tipo...</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-1.5 mb-5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {tipoForzado ? 'Comentario (opcional)' : 'Descripción adicional'}
            </label>
            <textarea
              value={descripcion}
              onChange={e => setDesc(e.target.value)}
              placeholder={tipoForzado ? 'Agregue un comentario sobre este SKU...' : 'Describa el problema con más detalle...'}
              rows={3}
              className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          {!tipoForzado && (
            <button
              onClick={onCerrar}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleConfirmar}
            disabled={!tipo}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-2.5 text-xs font-bold transition-colors"
          >
            {tipoForzado ? 'Continuar' : 'Confirmar Incidencia'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL QR / REPORTE PALLET ───────────────────────────────────────────────
function ModalQR({ grupos, onCerrar }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const payload = JSON.stringify({ grupos, ts: new Date().toISOString() });
    QRCode.toDataURL(payload, { width: 240, margin: 2, errorCorrectionLevel: 'M' })
      .then(url => setQrUrl(url))
      .catch(() => {});
  }, [grupos]);

  const totalUnidades = grupos.reduce((s, g) => s + g.series.length, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* Header fijo */}
        <div className="bg-blue-600 px-5 py-3 flex items-center justify-between rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-white">⬛</span>
            <h2 className="text-sm font-bold text-white">
              Pallet — {grupos.length} SKU{grupos.length > 1 ? 's' : ''} · {totalUnidades} uds
            </h2>
          </div>
          <button onClick={onCerrar} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
        </div>

        {/* Cuerpo scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">

          {/* QR + resumen lado a lado */}
          <div className="flex gap-4 items-start">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 shrink-0">
              {qrUrl
                ? <img src={qrUrl} alt="QR" className="w-28 h-28" />
                : <div className="w-28 h-28 flex items-center justify-center text-xs text-gray-300">Generando...</div>
              }
            </div>
            <div className="flex-1 min-w-0 space-y-1.5 pt-1">
              {grupos.map((g, i) => (
                <div key={i} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-bold text-blue-700 font-mono">{g.sku}</span>
                  <span className="text-[10px] font-bold text-blue-500">{g.series.length} uds</span>
                </div>
              ))}
            </div>
          </div>

          {/* Series por SKU con rangos */}
          <div className="space-y-3">
            {grupos.map((g, gi) => {
              const rangos = comprimirRangos(g.series);
              return (
                <div key={gi} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">SKU: {g.sku}</span>
                    <span className="text-[10px] font-bold text-gray-400">{g.series.length} unidades</span>
                  </div>
                  <div className="px-4 py-2 space-y-0.5">
                    {rangos.map((r, i) => (
                      <p key={i} className="text-[11px] font-mono text-gray-600">{i + 1}. {r}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones fijos al fondo */}
        <div className="px-5 pb-5 pt-3 flex gap-3 shrink-0 border-t border-gray-100">
          <button
            onClick={() => generarPdfPallet(grupos, qrUrl)}
            disabled={!qrUrl}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl py-2.5 text-xs font-bold transition-colors"
          >
            ↓ Descargar Reporte PDF
          </button>
          <button
            onClick={onCerrar}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SECCIÓN NÚMEROS DE SERIE ─────────────────────────────────────────────────
function SeccionNumerosDeSerie({ producto, palletPendiente, onSiguienteSku, onQRGenerado, onFinalizar, guardando }) {
  const [series, setSeries]               = useState([]);
  const [seriesCommitidas, setCommitidas] = useState([]);
  const [serieInput, setSerieInput]       = useState('');
  const [modalAbierto, setModal]          = useState(false);
  const [modalQR, setModalQR]             = useState(false);
  const [modalSeriesSinQR, setModalSeriesSinQR] = useState(false);
  const [incidencias, setIncidencias]     = useState([]);
  const [modalSkuDesconocido, setModalSkuDesconocido] = useState(producto?.skuNoEnCatalogo ?? false);
  const inputRef = useRef(null);
  const total    = Number(producto.cantidadEsperada) || 0;

  useEffect(() => { inputRef.current?.focus(); }, []);

  const totalEscaneado = seriesCommitidas.length + series.length;

  // Grupos que irán en el próximo QR: carry-over de SKUs anteriores + actuales
  const gruposParaQR = [
    ...palletPendiente,
    ...(series.length > 0 ? [{ sku: producto.sku, series }] : []),
  ];

  const agregarSerie = () => {
    const val = serieInput.trim();
    if (!val) return;
    const todasSeries = [...seriesCommitidas, ...series];
    if (todasSeries.includes(val)) {
      setSerieInput('');
      return;
    }
    setSeries(prev => [...prev, val]);
    setSerieInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); agregarSerie(); }
  };

  const onIncidenciaConfirmada = (inc) => {
    setIncidencias(prev => [...prev, inc]);
  };

  const handleGenerarQR = () => {
    if (gruposParaQR.length === 0) return;
    setModalQR(true);
  };

  const handleQRListo = () => {
    setCommitidas(prev => [...prev, ...series]);
    setSeries([]);
    setModalQR(false);
    onQRGenerado(); // limpia palletPendiente en el padre
    inputRef.current?.focus();
  };

  const handleSiguiente = () => {
    if (series.length > 0) {
      setModalSeriesSinQR(true);
      return;
    }
    onSiguienteSku({ series: seriesCommitidas, incidencias, seriesPendientes: null });
  };

  const handleConfirmarSiguienteSinQR = () => {
    setModalSeriesSinQR(false);
    // series incompletas van al palletPendiente del padre para el siguiente QR
    onSiguienteSku({
      series:           seriesCommitidas,
      incidencias,
      seriesPendientes: { sku: producto.sku, series },
    });
  };

  const canGenerarQR = gruposParaQR.length > 0 && gruposParaQR.some(g => g.series.length > 0);

  return (
    <>
      {/* Modal advertencia: series sin QR al cambiar SKU */}
      {modalSeriesSinQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-amber-500 px-6 py-4 flex items-center gap-2">
              <span className="text-white text-lg">⚠️</span>
              <h2 className="text-sm font-bold text-white">Pallet incompleto</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Tienes <span className="font-bold text-amber-600">{series.length} serie{series.length > 1 ? 's' : ''}</span> de <span className="font-bold">{producto.sku}</span> sin QR.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Si continúas, esas series se <span className="font-semibold text-blue-600">reservarán para el siguiente pallet</span> y se incluirán en el próximo QR junto con el nuevo SKU.
              </p>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setModalSeriesSinQR(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-xs font-bold transition-colors"
              >
                ← Generar QR ahora
              </button>
              <button
                onClick={handleConfirmarSiguienteSinQR}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Reservar y continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal incidencia auto para SKU desconocido */}
      {modalSkuDesconocido && (
        <ModalIncidencia
          sku={producto.sku}
          tipoForzado="SKU no detectado"
          comentarioInicial=""
          onCerrar={() => setModalSkuDesconocido(false)}
          onConfirmar={(inc) => {
            onIncidenciaConfirmada(inc);
            setModalSkuDesconocido(false);
          }}
        />
      )}

      {modalAbierto && (
        <ModalIncidencia
          sku={producto.sku}
          onCerrar={() => setModal(false)}
          onConfirmar={onIncidenciaConfirmada}
        />
      )}

      {modalQR && (
        <ModalQR
          grupos={gruposParaQR}
          onCerrar={handleQRListo}
        />
      )}

      <div className="bg-white rounded-xl border-2 border-blue-500 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">#</span>
            <div>
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Números de Serie</h2>
              <p className="text-[10px] text-gray-400">{producto.sku} — Escaneando series</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {seriesCommitidas.length > 0 && (
              <span className="text-[10px] text-blue-400 font-medium">
                {seriesCommitidas.length} en QR
              </span>
            )}
            <span className={`text-xs font-black px-3 py-1 rounded-full
              ${total > 0 && totalEscaneado >= total ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {totalEscaneado} / {total || '?'}
              {total > 0 && totalEscaneado < total && (
                <span className="ml-1 font-normal text-blue-500">
                  (faltan {total - totalEscaneado})
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* Banner: carry-over de SKUs anteriores */}
          {palletPendiente.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                Pallet en construcción — SKUs anteriores reservados
              </p>
              {palletPendiente.map((p, i) => (
                <p key={i} className="text-xs text-blue-600 font-medium">
                  • {p.sku}: {p.series.length} serie{p.series.length !== 1 ? 's' : ''}
                </p>
              ))}
              <p className="text-[10px] text-blue-400 mt-1">
                El próximo QR incluirá estas series junto con las de {producto.sku}.
              </p>
            </div>
          )}

          {/* SKU no en catálogo banner */}
          {producto.skuNoEnCatalogo && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
              <div>
                <p className="text-xs font-bold text-amber-800">SKU fuera de catálogo</p>
                <p className="text-[11px] text-amber-700">
                  Se registró incidencia automática "SKU no detectado". Puede continuar escaneando series.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Escanear / Ingresar Número de Serie
            </label>
            <div className="flex gap-2">
              <div className="flex-1 border-2 border-blue-400 rounded-xl px-4 py-3 flex items-center gap-3 bg-white">
                <span className="text-blue-400 text-xs">⬡</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={serieInput}
                  onChange={e => setSerieInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escanee o escriba la serie y presione Enter..."
                  className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-300 font-medium"
                />
              </div>
              <button
                onClick={agregarSerie}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Series actuales (del pallet en curso) */}
          {series.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Series en pallet actual — {producto.sku} ({series.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1.5">
                {series.map((s, i) => (
                  <div key={s} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-green-500">{seriesCommitidas.length + i + 1}.</span>
                      <span className="text-xs font-mono text-gray-700">{s}</span>
                    </div>
                    <button
                      onClick={() => setSeries(prev => prev.filter(x => x !== s))}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Series ya commitidas a QR anteriores */}
          {seriesCommitidas.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                Series ya en QR generado ({seriesCommitidas.length})
              </p>
            </div>
          )}

          {incidencias.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1.5">
                Incidencias registradas ({incidencias.length})
              </p>
              {incidencias.map((inc, i) => (
                <p key={i} className="text-xs text-orange-700 font-medium">• {inc.tipo}</p>
              ))}
            </div>
          )}

          <button
            onClick={() => setModal(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>⚠️</span> Reportar Incidencia
          </button>

          <button
            onClick={handleGenerarQR}
            disabled={!canGenerarQR}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>⬛</span>
            {!canGenerarQR
              ? 'Generar QR (escanee series primero)'
              : `Generar Reporte QR (${gruposParaQR.reduce((s, g) => s + g.series.length, 0)} series · ${gruposParaQR.length} SKU${gruposParaQR.length > 1 ? 's' : ''})`}
          </button>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSiguiente}
              className="flex-1 border-2 border-blue-500 text-blue-600 font-bold py-3 rounded-xl text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
            >
              › Siguiente SKU
            </button>
            <button
              onClick={() => onFinalizar({ series: [...seriesCommitidas, ...series], incidencias })}
              disabled={guardando}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
            >
              {guardando ? 'Guardando...' : '✓ Finalizar'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── TARJETA CONTENEDOR VERIFICADO ───────────────────────────────────────────
function TarjetaContenedorVerificado({ contenedor, operador, onCambiar }) {
  const pos     = [...new Set(contenedor.detalles.map(d => d.ordenCompra))];
  const poLabel = pos.length === 1 ? pos[0] : `${pos.length} órdenes`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">🚢</span>
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Datos del Contenedor</h2>
        </div>
        <span className="text-[10px] font-bold text-green-600">✓ Verificado</span>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">ID del Contenedor</label>
          <div className="border-2 border-green-400 rounded-xl bg-green-50/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-xs">⬡</span>
              <span className="text-sm font-bold text-gray-800">{contenedor.numeroContenedor}</span>
            </div>
            <button
              onClick={onCambiar}
              className="text-xs font-bold text-red-500 border border-red-300 rounded-lg px-3 py-1 hover:bg-red-50 transition-colors"
            >
              Cambiar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">PO #</label>
            <div className="border border-green-300 rounded-xl bg-green-50/30 px-4 py-3 flex items-center gap-2">
              <span className="text-green-500 text-xs">✓</span>
              <span className="text-sm font-semibold text-gray-700">{poLabel}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Operador</label>
            <div className="border border-green-300 rounded-xl bg-green-50/30 px-4 py-3 flex items-center gap-2">
              <span className="text-green-500 text-xs">✓</span>
              <span className="text-sm font-semibold text-gray-700">{operador?.name ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TARJETA REGISTRO SKU ─────────────────────────────────────────────────────
function TarjetaRegistroSKU({ contenedor, onSkuCargado }) {
  const [sku, setSku]                     = useState('');
  const [cargando, setCargando]           = useState(false);
  const [aviso, setAviso]                 = useState('');
  const [productoEncontrado, setProducto] = useState(null);

  const manejarCarga = async (e) => {
    e.preventDefault();
    if (!sku.trim()) return;
    setCargando(true);
    setAviso('');
    setProducto(null);
    onSkuCargado(null);

    const skuTrimmed = sku.trim();

    try {
      let productoBase = null;
      let esComplemento = false;
      let skuPadre = null;

      // Intento 1: buscar SKU exacto
      try {
        productoBase = await buscarProductoPorSku(skuTrimmed);
      } catch {
        // Intento 2: si tiene sufijo _N, buscar el SKU padre
        const underscoreIdx = skuTrimmed.lastIndexOf('_');
        if (underscoreIdx > 0) {
          const candidatoPadre = skuTrimmed.substring(0, underscoreIdx);
          try {
            productoBase = await buscarProductoPorSku(candidatoPadre);
            esComplemento = true;
            skuPadre = candidatoPadre;
          } catch {
            // Padre tampoco existe → fantasma
          }
        }
      }

      if (productoBase) {
        const detalleMatch =
          contenedor.detalles.find(d => d.codigo.trim().toUpperCase() === skuTrimmed.toUpperCase()) ??
          (esComplemento
            ? contenedor.detalles.find(d => d.codigo.trim().toUpperCase() === skuPadre.toUpperCase())
            : null);

        const resultado = {
          ...productoBase,
          sku:              skuTrimmed,
          name:             esComplemento ? `${productoBase.name} (Complemento)` : productoBase.name,
          cantidadEsperada: detalleMatch ? (detalleMatch.shp_qty ?? detalleMatch.cantidad ?? '—') : '—',
          enContenedor:     !!detalleMatch,
          skuNoEnCatalogo:  false,
          esComplemento,
          skuPadre,
          ordenCompra:      detalleMatch?.ordenCompra ?? '—',
          arriboDetalleId:  detalleMatch?.arriboDetalleId ?? null,
        };

        if (esComplemento) {
          setAviso(`__complemento__Complemento de ${skuPadre} — aceptado sin incidencia.`);
        }
        setProducto(resultado);
        onSkuCargado(resultado);
      } else {
        // SKU completamente desconocido
        const detalleMatch = contenedor.detalles.find(
          d => d.codigo.trim().toUpperCase() === skuTrimmed.toUpperCase()
        );
        const fantasma = {
          sku:              skuTrimmed,
          name:             'Producto no registrado en catálogo',
          cantidadEsperada: detalleMatch?.cantidad ?? '—',
          enContenedor:     !!detalleMatch,
          skuNoEnCatalogo:  true,
          ordenCompra:      detalleMatch?.ordenCompra ?? '—',
          arriboDetalleId:  detalleMatch?.arriboDetalleId ?? null,
          peso:             null,
          altoProducto:     null,
          anchoProducto:    null,
          largoProducto:    null,
        };
        setAviso('SKU no encontrado en el catálogo — se registrará incidencia automática.');
        setProducto(fantasma);
        onSkuCargado(fantasma);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-blue-500 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px]">▌▌▌</span>
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Registro de Producto (SKU)</h2>
        </div>
        {productoEncontrado && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            {productoEncontrado.sku}
          </span>
        )}
      </div>

      <form onSubmit={manejarCarga} className="p-6 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Código SKU</label>
          <div className="flex gap-3">
            <div className="flex-1 border-2 border-blue-400 rounded-xl px-4 py-3 flex items-center gap-3 bg-white">
              <span className="text-blue-400 text-xs">▌▌▌</span>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="Escanee o ingrese SKU..."
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-300 font-medium"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold px-6 rounded-xl text-xs transition-colors"
            >
              {cargando ? '...' : 'Cargar'}
            </button>
          </div>

          {aviso && (
            aviso.startsWith('__complemento__') ? (
              <div className="flex items-start gap-2 mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-green-500 text-xs mt-0.5">✓</span>
                <p className="text-xs text-green-700 font-medium">{aviso.replace('__complemento__', '')}</p>
              </div>
            ) : (
              <div className="flex items-start gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="text-amber-500 text-xs mt-0.5">⚠️</span>
                <p className="text-xs text-amber-700 font-medium">{aviso}</p>
              </div>
            )
          )}
          {!aviso && (
            <p className="text-[10px] text-gray-400 mt-1.5">
              Cualquier SKU es válido. Los no esperados se marcarán como incidencia automáticamente.
            </p>
          )}
        </div>

        {productoEncontrado && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Descripción</label>
                <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50">
                  <span className="text-sm text-gray-700 font-medium">{productoEncontrado.name}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Cantidad Esperada</label>
                <div className="border border-blue-200 rounded-xl px-4 py-3 bg-blue-50/40 flex items-center justify-between">
                  <span className="text-lg font-black text-blue-700">{productoEncontrado.cantidadEsperada}</span>
                  <span className="text-[10px] text-blue-400 font-bold">uds</span>
                </div>
              </div>
            </div>
            {!productoEncontrado.enContenedor && !productoEncontrado.skuNoEnCatalogo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 font-semibold">
                  ⚠️ SKU no esperado en este contenedor — se registrará como incidencia
                </p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

// ─── PANEL PRODUCTO (derecha) ─────────────────────────────────────────────────
function PanelProducto({ producto }) {
  if (!producto) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[220px]">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 text-2xl mb-4">📦</div>
        <h3 className="text-xs font-bold text-gray-400 tracking-wide">Ingrese un SKU</h3>
        <p className="text-[11px] text-gray-300 mt-1 max-w-[180px]">La imagen del producto aparecerá aquí</p>
      </div>
    );
  }

  const medidas = [producto.altoProducto, producto.anchoProducto, producto.largoProducto]
    .filter(Boolean).map(v => Number(v).toFixed(1)).join(' × ');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-40 flex items-center justify-center ${producto.skuNoEnCatalogo ? 'bg-amber-50' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
        <span className={`text-6xl ${producto.skuNoEnCatalogo ? 'opacity-60' : 'opacity-30'}`}>
          {producto.skuNoEnCatalogo ? '❓' : '📦'}
        </span>
      </div>
      <div className="p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-800 leading-snug">{producto.name}</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Esperado</p>
            <p className="text-sm font-black text-gray-700">{producto.cantidadEsperada}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Peso</p>
            <p className="text-sm font-black text-gray-700">{producto.peso ? `${Number(producto.peso).toFixed(1)} kg` : '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Medidas</p>
            <p className="text-[10px] font-bold text-gray-700">{medidas ? `${medidas} cm` : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function EscaneoContenedor({ contenedor, alRegresar, alCambiarContenedor }) {
  const [pasoLocal, setPasoLocal]           = useState('equipo');
  const [operador, setOperador]             = useState(null);
  const [productoActual, setProductoActual] = useState(null);
  const [skusEscaneados, setSkusEscaneados] = useState([]);
  const [palletPendiente, setPalletPendiente] = useState([]); // series sin QR de SKUs anteriores
  const [guardando, setGuardando]           = useState(false);

  const handleOperadorSeleccionado = (op) => {
    setOperador(op);
    setPasoLocal('escaneo');
  };

  const handleSiguienteSku = ({ series, incidencias, seriesPendientes }) => {
    if (productoActual) {
      setSkusEscaneados(prev => [...prev, {
        arriboDetalleId: productoActual.arriboDetalleId ?? null,
        sku:             productoActual.sku,
        incidencias:     incidencias.map(i => ({
          tipo:        i.tipo,
          descripcion: i.descripcion || null,
          numeroSerie: i.numeroSerie || null,
        }))
      }]);
    }
    // Acumular series incompletas en el pallet pendiente
    if (seriesPendientes && seriesPendientes.series.length > 0) {
      setPalletPendiente(prev => {
        const existing = prev.find(x => x.sku === seriesPendientes.sku);
        if (existing) {
          return prev.map(x => x.sku === seriesPendientes.sku
            ? { ...x, series: [...x.series, ...seriesPendientes.series] }
            : x
          );
        }
        return [...prev, { sku: seriesPendientes.sku, series: seriesPendientes.series }];
      });
    }
    setProductoActual(null);
  };

  const handlePalletCompletado = () => {
    setPalletPendiente([]);
  };

  const handleFinalizar = async ({ series, incidencias }) => {
    const skuActual = productoActual ? [{
      arriboDetalleId: productoActual.arriboDetalleId ?? null,
      sku:             productoActual.sku,
      incidencias:     incidencias.map(i => ({
        tipo:        i.tipo,
        descripcion: i.descripcion || null,
        numeroSerie: i.numeroSerie || null,
      }))
    }] : [];

    const payload = {
      arriboId:       contenedor.arriboId,
      operadorId:     operador.id,
      skusEscaneados: [...skusEscaneados, ...skuActual]
    };

    setGuardando(true);
    try {
      await crearRecepcion(payload);
      alRegresar();
    } catch {
      alert('Error al guardar la recepción. Intente de nuevo.');
      setGuardando(false);
    }
  };

  const stepperPaso = pasoLocal === 'equipo' ? 2 : productoActual ? 4 : 3;

  return (
    <main className="p-8 max-w-[1400px] w-full mx-auto space-y-6 text-gray-800">

      <div className="flex items-center gap-4">
        <button
          onClick={alRegresar}
          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm"
        >←</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Entrada de Importación</h1>
          <p className="text-xs text-gray-400 mt-0.5">Recepción y registro de mercancía importada</p>
        </div>
      </div>

      <StepperContenedor paso={stepperPaso} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <div className="lg:col-span-2 space-y-4">
          <TarjetaContenedorVerificado
            contenedor={contenedor}
            operador={operador}
            onCambiar={alCambiarContenedor}
          />

          {pasoLocal === 'equipo' && (
            <SeleccionEquipo onOperadorSeleccionado={handleOperadorSeleccionado} />
          )}

          {pasoLocal === 'escaneo' && (
            <>
              <TarjetaRegistroSKU contenedor={contenedor} onSkuCargado={setProductoActual} />

              {productoActual && (
                <SeccionNumerosDeSerie
                  producto={productoActual}
                  palletPendiente={palletPendiente}
                  onSiguienteSku={handleSiguienteSku}
                  onQRGenerado={handlePalletCompletado}
                  onFinalizar={handleFinalizar}
                  guardando={guardando}
                />
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          <PanelProducto producto={productoActual} />

          {/* Pallet pendiente visible en sidebar */}
          {palletPendiente.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                Pallet en construcción
              </p>
              {palletPendiente.map((p, i) => (
                <p key={i} className="text-xs text-blue-700 font-medium">
                  📦 {p.sku} — {p.series.length} series
                </p>
              ))}
            </div>
          )}

          {skusEscaneados.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2">
                SKUs completados ({skusEscaneados.length})
              </p>
              {skusEscaneados.map((s, i) => (
                <p key={i} className="text-xs text-green-700 font-medium">
                  {s.arriboDetalleId ? '✓' : '⚠️'} {s.sku}
                </p>
              ))}
            </div>
          )}

          <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-5 text-left shadow-sm">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">💡 Tip de escaneo</h4>
            <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
              El lector USB envía los datos como teclado. Asegúrese de que el campo esté enfocado (<span className="text-blue-600 font-bold">borde azul</span>) antes de escanear.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
