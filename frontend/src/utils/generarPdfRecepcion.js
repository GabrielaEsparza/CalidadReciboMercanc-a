import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND_COLOR  = [37, 99, 235];   // blue-600
const ORANGE_COLOR = [234, 88, 12];   // orange-600
const GREEN_COLOR  = [22, 163, 74];   // green-600
const GRAY_TEXT    = [75, 85, 99];
const LIGHT_GRAY   = [243, 244, 246];

function formatFecha(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function generarPdfRecepcion(recepcion, arriboDetalle) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = margin;

  // ── HEADER BAR ──────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageW, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Recibo de Mercancía", margin, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado: ${formatFecha(new Date().toISOString())}`,
    pageW - margin,
    14,
    { align: "right" }
  );

  y = 32;

  // ── REC ID + CONTENEDOR ─────────────────────────────────────────────────────
  const recId = `REC-${String(recepcion.id).padStart(4, "0")}`;
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(recId, margin, y);

  doc.setTextColor(...GRAY_TEXT);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(recepcion.contenedor, margin + 36, y);

  // estado badge (texto)
  const tieneInc = recepcion.totalIncidencias > 0;
  doc.setTextColor(...(tieneInc ? ORANGE_COLOR : GREEN_COLOR));
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const badge = tieneInc
    ? `⚠  ${recepcion.totalIncidencias} incidencia${recepcion.totalIncidencias > 1 ? "s" : ""}`
    : "✓  Sin incidencias";
  doc.text(badge, pageW - margin, y, { align: "right" });

  y += 10;

  // ── CARDS: operador / llegada / incidencias ──────────────────────────────────
  const cardW = (pageW - margin * 2 - 8) / 3;
  const cards = [
    { label: "OPERADOR",         value: recepcion.operador },
    { label: "FECHA LLEGADA",    value: formatFecha(recepcion.fechaLlegada) },
    { label: "TOTAL INCIDENCIAS", value: String(recepcion.totalIncidencias) },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 4);
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(x, y, cardW, 16, 2, 2, "F");

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(card.label, x + 5, y + 6);

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 5, y + 13);
  });

  y += 24;

  // ── DETALLE DEL ARRIBO ───────────────────────────────────────────────────────
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DEL ARRIBO", margin, y);

  if (arriboDetalle?.detalles?.length) {
    const totalEsp = arriboDetalle.detalles.reduce((s, d) => s + d.cantidad, 0);

    doc.setTextColor(...GRAY_TEXT);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${arriboDetalle.detalles.length} línea${arriboDetalle.detalles.length !== 1 ? "s" : ""}  ·  ${totalEsp.toLocaleString()} unidades esperadas`,
      margin + 42,
      y
    );

    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Orden de Compra", "SKU", "Cant. Esperada", "Cant. Recibida"]],
      body: arriboDetalle.detalles.map(d => [
        d.ordenCompra || "—",
        d.codigo,
        d.cantidad.toLocaleString(),
        "—",
      ]),
      foot: totalEsp > 0
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
    y += 6;
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Sin detalles de arribo disponibles.", margin, y);
    y += 8;
  }

  // ── INCIDENCIAS ─────────────────────────────────────────────────────────────
  if (tieneInc) {
    doc.setTextColor(...ORANGE_COLOR);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`INCIDENCIAS (${recepcion.totalIncidencias})`, margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["SKU", "Tipo", "N° Serie", "Observación"]],
      body: recepcion.incidencias.map(inc => [
        inc.skuProducto,
        inc.tipoIncidencia,
        inc.numeroSerie || "—",
        inc.observacion || "—",
      ]),
      styles:     { fontSize: 8, cellPadding: 3, textColor: [55, 65, 81] },
      headStyles: { fillColor: ORANGE_COLOR, textColor: 255, fontStyle: "bold", fontSize: 7.5 },
      alternateRowStyles: { fillColor: [255, 247, 237] },
    });

    y = doc.lastAutoTable.finalY + 8;
  } else {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y, pageW - margin * 2, 10, 2, 2, "F");
    doc.setTextColor(...GREEN_COLOR);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("✓  Recepción sin incidencias — todo OK.", margin + 5, y + 6.5);
    y += 16;
  }

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Calidad — Recibo de Mercancía", margin, pageH - 8);
  doc.text(`${recId}`, pageW - margin, pageH - 8, { align: "right" });

  doc.save(`${recId}_${recepcion.contenedor}.pdf`);
}
