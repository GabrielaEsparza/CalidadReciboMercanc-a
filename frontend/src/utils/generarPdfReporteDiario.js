import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND_COLOR  = [37, 99, 235];
const ORANGE_COLOR = [234, 88, 12];
const GREEN_COLOR  = [22, 163, 74];
const GRAY_TEXT    = [75, 85, 99];
const LIGHT_GRAY   = [243, 244, 246];
const PAGE_H       = 297; // A4 mm
const MARGIN       = 18;
const SECTION_BREAK_THRESHOLD = 60; // mínimo espacio antes de salto de página

function formatFecha(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatFechaCorta(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function esHoy(iso, ref) {
  if (!iso) return false;
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth()    === ref.getMonth() &&
    d.getDate()     === ref.getDate()
  );
}

function checkPage(doc, y, needed = SECTION_BREAK_THRESHOLD) {
  if (y + needed > PAGE_H - 20) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawHeaderBar(doc, pageW, labelFecha) {
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte Diario — Recibo de Mercancía", MARGIN, 14);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado: ${formatFecha(new Date().toISOString())}`, pageW - MARGIN, 14, { align: "right" });
}

function drawFooters(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageH     = doc.internal.pageSize.getHeight();
  const pageW     = doc.internal.pageSize.getWidth();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(229, 231, 235);
    doc.line(MARGIN, pageH - 14, pageW - MARGIN, pageH - 14);
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Calidad — Recibo de Mercancía", MARGIN, pageH - 8);
    doc.text(`Página ${p} de ${pageCount}`, pageW - MARGIN, pageH - 8, { align: "right" });
  }
}

// arriboDetallesMap: { [contenedor]: { detalles: [{ordenCompra, codigo, cantidad}] } | null }
export function generarPdfReporteDiario(recepciones, arriboDetallesMap = {}, fechaFiltro) {
  const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = MARGIN;

  const datos = fechaFiltro
    ? recepciones.filter(r => esHoy(r.fechaLlegada, fechaFiltro))
    : recepciones;

  const totalInc = datos.reduce((s, r) => s + r.totalIncidencias, 0);
  const conInc   = datos.filter(r => r.totalIncidencias > 0).length;
  const sinInc   = datos.length - conInc;
  const labelFecha = fechaFiltro
    ? formatFechaCorta(fechaFiltro.toISOString())
    : "Todas las fechas";

  // ── PÁGINA 1: PORTADA / RESUMEN ─────────────────────────────────────────────
  drawHeaderBar(doc, pageW, labelFecha);
  y = 30;

  // Fecha
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  const fechaCap = labelFecha.charAt(0).toUpperCase() + labelFecha.slice(1);
  doc.text(fechaCap, MARGIN, y);
  y += 11;

  // Cards resumen
  const cardW = (pageW - MARGIN * 2 - 12) / 4;
  [
    { label: "RECEPCIONES",     value: String(datos.length), color: BRAND_COLOR },
    { label: "SIN INCIDENCIAS", value: String(sinInc),       color: GREEN_COLOR },
    { label: "CON INCIDENCIAS", value: String(conInc),       color: conInc  > 0 ? ORANGE_COLOR : GRAY_TEXT },
    { label: "TOTAL INC.",      value: String(totalInc),     color: totalInc > 0 ? ORANGE_COLOR : GRAY_TEXT },
  ].forEach((card, i) => {
    const x = MARGIN + i * (cardW + 4);
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(x, y, cardW, 16, 2, 2, "F");
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text(card.label, x + 4, y + 6);
    doc.setTextColor(...card.color);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 4, y + 13.5);
  });
  y += 24;

  // Tabla índice
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ÍNDICE DE RECEPCIONES", MARGIN, y);
  y += 4;

  if (datos.length === 0) {
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Sin recepciones para esta fecha.", MARGIN, y + 6);
    drawFooters(doc);
    doc.save(
      fechaFiltro
        ? `reporte_${fechaFiltro.toISOString().slice(0, 10)}.pdf`
        : "reporte_completo.pdf"
    );
    return;
  }

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["ID", "Contenedor", "Operador", "Llegada", "SKUs", "Inc.", "Estado"]],
    body: datos.map(r => {
      const det = arriboDetallesMap[r.contenedor];
      const lineas = det?.detalles?.length ?? "—";
      const total  = det?.detalles?.reduce((s, d) => s + d.cantidad, 0) ?? "—";
      return [
        `REC-${String(r.id).padStart(4, "0")}`,
        r.contenedor,
        r.operador,
        formatFecha(r.fechaLlegada),
        lineas !== "—" ? `${lineas} líneas / ${Number(total).toLocaleString()} u` : "—",
        r.totalIncidencias > 0 ? String(r.totalIncidencias) : "—",
        r.totalIncidencias === 0 ? "OK" : "Incidencias",
      ];
    }),
    styles:     { fontSize: 7.5, cellPadding: 2.5, textColor: [55, 65, 81] },
    headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontStyle: "bold", fontSize: 7 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 22 },
      5: { halign: "center" },
      6: { halign: "center", fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didDrawCell(data) {
      if (data.section === "body" && data.column.index === 6) {
        doc.setTextColor(...(data.cell.text[0] === "OK" ? GREEN_COLOR : ORANGE_COLOR));
      }
    },
  });

  // ── DETALLE POR RECEPCIÓN (una sección por cada una) ────────────────────────
  datos.forEach((r, idx) => {
    const recId      = `REC-${String(r.id).padStart(4, "0")}`;
    const det        = arriboDetallesMap[r.contenedor];
    const tieneInc   = r.totalIncidencias > 0;
    const totalEsp   = det?.detalles?.reduce((s, d) => s + d.cantidad, 0) ?? 0;

    // Siempre abrir nueva página para cada recepción
    doc.addPage();
    y = MARGIN;

    // ── Separador de sección ──────────────────────────────────────────────────
    doc.setFillColor(...BRAND_COLOR);
    doc.roundedRect(MARGIN, y, pageW - MARGIN * 2, 14, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${recId}  ·  ${r.contenedor}`, MARGIN + 5, y + 9.5);

    // badge estado
    const badgeText = tieneInc
      ? `⚠  ${r.totalIncidencias} incidencia${r.totalIncidencias > 1 ? "s" : ""}`
      : "✓  Sin incidencias";
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(badgeText, pageW - MARGIN - 5, y + 9.5, { align: "right" });

    y += 20;

    // ── Mini-cards: operador / llegada / incidencias ──────────────────────────
    const cW = (pageW - MARGIN * 2 - 8) / 3;
    [
      { label: "OPERADOR",         value: r.operador },
      { label: "FECHA LLEGADA",    value: formatFecha(r.fechaLlegada) },
      { label: "TOTAL INCIDENCIAS", value: String(r.totalIncidencias) },
    ].forEach((card, i) => {
      const x = MARGIN + i * (cW + 4);
      doc.setFillColor(...LIGHT_GRAY);
      doc.roundedRect(x, y, cW, 15, 2, 2, "F");
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text(card.label, x + 4, y + 5.5);
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(card.value, x + 4, y + 12);
    });
    y += 22;

    // ── Detalle del arribo ────────────────────────────────────────────────────
    doc.setTextColor(...BRAND_COLOR);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DEL ARRIBO", MARGIN, y);

    if (det?.detalles?.length) {
      doc.setTextColor(...GRAY_TEXT);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${det.detalles.length} línea${det.detalles.length !== 1 ? "s" : ""}  ·  ${totalEsp.toLocaleString()} unidades esperadas`,
        MARGIN + 40,
        y
      );
      y += 3;

      autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        head: [["Orden de Compra", "SKU", "Cant. Esperada", "Cant. Recibida"]],
        body: det.detalles.map(d => [
          d.ordenCompra || "—",
          d.codigo,
          d.cantidad.toLocaleString(),
          "—",
        ]),
        foot: det.detalles.length > 1
          ? [["", "TOTAL", totalEsp.toLocaleString(), "—"]]
          : undefined,
        styles:      { fontSize: 8, cellPadding: 3, textColor: [55, 65, 81] },
        headStyles:  { fillColor: BRAND_COLOR, textColor: 255, fontStyle: "bold", fontSize: 7.5 },
        footStyles:  { fillColor: LIGHT_GRAY, textColor: [31, 41, 55], fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 42 },
          2: { halign: "right" },
          3: { halign: "right", textColor: [156, 163, 175] },
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      y += 5;
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("Sin detalles de arribo disponibles.", MARGIN, y);
      y += 8;
    }

    // ── Incidencias de esta recepción ─────────────────────────────────────────
    y = checkPage(doc, y, 40);

    if (tieneInc) {
      doc.setTextColor(...ORANGE_COLOR);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(`INCIDENCIAS (${r.totalIncidencias})`, MARGIN, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        head: [["SKU", "Tipo", "N° Serie", "Observación"]],
        body: r.incidencias.map(inc => [
          inc.skuProducto,
          inc.tipoIncidencia,
          inc.numeroSerie || "—",
          inc.observacion || "—",
        ]),
        styles:     { fontSize: 7.5, cellPadding: 2.5, textColor: [55, 65, 81] },
        headStyles: { fillColor: ORANGE_COLOR, textColor: 255, fontStyle: "bold", fontSize: 7 },
        alternateRowStyles: { fillColor: [255, 247, 237] },
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(MARGIN, y, pageW - MARGIN * 2, 10, 2, 2, "F");
      doc.setTextColor(...GREEN_COLOR);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("✓  Recepción sin incidencias — todo OK.", MARGIN + 5, y + 6.5);
    }
  });

  drawFooters(doc);

  doc.save(
    fechaFiltro
      ? `reporte_${fechaFiltro.toISOString().slice(0, 10)}.pdf`
      : "reporte_completo.pdf"
  );
}
