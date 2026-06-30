# CalidadReciboMercancía — Estado del Proyecto
> Última actualización: 2026-06-29 · Branch activo: `angel`

## Stack
- **Backend**: ASP.NET Core 9, EF Core + MySQL (Pomelo), Dapper + ODBC (ERP), ClosedXML (Excel)
- **Frontend**: React + Vite + Tailwind CSS
- **DB local**: MySQL — `recibo_mercancia_db`
- **ERP**: SQL Server vía ODBC (`Driver={SQL Server}`)

---

## Esquema DB actual (migración: `NuevoEsquema`)

| Tabla | PK | Notas |
|---|---|---|
| `productos` | `Sku` (string) | PK es string, igual que `Articulo` del ERP |
| `operadores` | `Id` (int) | Campo `Name` (no Nombre) |
| `arribos` | `Id` (int) | Índice único en `Contenedor` |
| `arribos_detalle` | `Id` (int) | FK→arribos (cascade), FK→productos (Sku) |
| `incidencias` | `Id` (int) | FK→productos, FK→arribos_detalle |
| `recepciones` | `Id` (int) | FK→arribos, FK→operadores |

---

## Endpoints Backend

### Productos
| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| `GET` | `/api/productos/{sku}` | ✅ | Busca producto por SKU |
| `POST` | `/poblar_catalogo_productos` | ✅ | Sync ERP→`productos` (4,252 registros) |

### Arribos
| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| `GET` | `/api/arribos/headers` | ✅ | Debug: columnas del Excel |
| `GET` | `/api/arribos/contenedor/{id}` | ✅ | Detalle arribo + detalles SKU desde DB |
| `POST` | `/api/arribos/importar` | ✅ | Persiste Arribos.xlsx→`arribos`+`arribos_detalle` |
| `GET` | `/api/arribos/skus-sin-catalogo` | ✅ | Genera Excel de SKUs no catalogados |

### Importacion
| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| `GET` | `/api/importacion/tablas_local` | ✅ | Lista todos los Arribos en DB |
| `GET` | `/api/importacion/tablas_local/buscar?contenedor=X&po=Y` | ✅ | Busca Arribo por contenedor y/o PO |

### Recepciones / Incidencias
| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| `GET` | `/api/recepciones` | ✅ | Lista recepciones con incidencias expandidas |
| `POST` | `/api/recepciones` | ✅ | Guarda recepción completa con SKUs e incidencias |

### ERP (auxiliares)
| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| `GET` | `/debug_art` | ✅ | Columnas + muestra tabla `art` del ERP |
| (varios) | `/api/erp/...` | ✅ | Exploración tablas ERP |

---

## Shapes de datos clave

**GET /api/recepciones** — cada item:
```json
{
  "id": 1, "arriboId": 5,
  "contenedor": "MSCU1234567", "operador": "Juan García",
  "fechaLlegada": "2026-06-28T09:00:00", "fechaSalida": "2026-06-28T11:30:00",
  "totalIncidencias": 2,
  "incidencias": [
    { "id": 1, "skuProducto": "SKU-001", "numeroSerie": null,
      "tipoIncidencia": "Dañado", "observacion": "Caja rota", "evidenciaFoto": null }
  ]
}
```

**GET /api/arribos/contenedor/{id}**:
```json
{
  "arriboId": 5, "numeroContenedor": "MSCU1234567", "estatus": "CONCLUIDO",
  "detalles": [
    { "arriboDetalleId": 12, "ordenCompra": "PO-2026-001", "codigo": "SKU-001", "cantidad": 100 }
  ]
}
```

---

## Frontend — Flujo actual

```
Login → Inicio (dashboard)
         ├─ RecepcionesTable   → historial de recepciones
         │    └─ RecepcionDetalleModal  ← click en fila → popup con detalle completo ✅ NUEVO
         └─ BuscarContenedor   → ingresa contenedor → llama GET /api/arribos/contenedor/{id}
              └─ EscaneoContenedor
                   ├─ TarjetaContenedorVerificado
                   ├─ TarjetaRegistroSKU  (GET /api/productos/{sku})
                   ├─ PanelProducto
                   ├─ SeccionNumerosDeSerie
                   │    ├─ Input serie, contador, lista escaneados
                   │    ├─ Botón "Reportar Incidencia" → ModalIncidencia
                   │    ├─ Botón "Siguiente SKU"
                   │    └─ Botón "Finalizar" → POST /api/recepciones ✅
                   └─ ModalIncidencia
```

### Archivos frontend clave
| Archivo | Estado |
|---|---|
| `src/pages/Inicio.jsx` | ✅ maneja paso dashboard/buscar/escaneo |
| `src/components/dashboard/RecepcionesTable.jsx` | ✅ tabla historial con modal |
| `src/components/dashboard/RecepcionDetalleModal.jsx` | ✅ popup detalle completo |
| `src/components/dashboard/BuscarContenedor.jsx` | ✅ |
| `src/components/dashboard/EscaneoContenedor.jsx` | ✅ UI completa conectada al backend |
| `src/services/recepciones.js` | ✅ getRecepciones, crearRecepcion |
| `src/services/arribos.js` | ✅ buscarContenedor |

---

## Pendiente

1. ⬜ **Poblar catálogo productos** — endpoint `/poblar_catalogo_productos` en Program.cs (verificar fix del syntax error)
2. ⬜ **Autenticación con roles** — guard frontend operador vs supervisor
3. ⬜ **Reportes / exportación** — recepciones a Excel
4. ⬜ **Paginación** — tabla recepciones carga todo, agregar paginado
5. ⬜ **Notificaciones tiempo real** — SignalR o polling
6. ⬜ **Vista SKUs sin catálogo** en dashboard (endpoint GET /api/arribos/skus-sin-catalogo ya existe)
7. ⬜ **Integración ERP completa** — ErpController existe, falta conectar lógica

---

## Notas técnicas importantes

- `Sku` es PK string en `productos` — NO hay Id numérico
- `ArriboDetalle.PO` a nivel detalle (un contenedor puede tener SKUs de diferentes POs)
- Números de contenedor pueden tener chars especiales → siempre usar query params, nunca route params
- `.Trim()` en comparaciones EF LINQ (la DB tiene whitespace en strings)
- EPPlus eliminado por licencia → se usa **ClosedXML**
- `XLCellValue` es struct, NO nullable → usar `.ToString()` directo
- `TRUNCATE TABLE productos` falla si hay FK desde `arribos_detalle`
- AutoMapper 15.0.0 resuelto (vulnerabilidad alta — pendiente parche)
- Conexión ERP vía env vars: `ERP_HOST`, `ERP_NAME`, `ERP_USER`, `ERP_PASSWORD`
- Conexión MySQL vía env vars: `DB_HOST`, `DB_USER`, `DB_PASSWORD`
