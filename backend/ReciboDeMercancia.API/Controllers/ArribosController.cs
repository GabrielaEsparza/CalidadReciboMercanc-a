using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Infrastructure.Data;
using ReciboDeMercancia.Domain.Entities;
using ClosedXML.Excel;

namespace ReciboDeMercancia.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArribosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ArribosController(AppDbContext context)
    {
        _context = context;
    }

    private string GetArribosPath()
    {
        var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        return Path.Combine(home, "Downloads", "Arribos.xlsx");
    }

    [HttpGet("headers")]
    public IActionResult GetHeaders()
    {
        var path = GetArribosPath();
        if (!System.IO.File.Exists(path))
            return NotFound(new { error = "Arribos.xlsx no encontrado" });

        using var wb = new XLWorkbook(path);
        var ws = wb.Worksheets.First();
        var headers = ws.FirstRowUsed().CellsUsed()
            .Select(c => new { col = c.Address.ColumnNumber, nombre = c.Value.ToString() })
            .ToList();
        return Ok(headers);
    }

    [HttpPost("importar")]
    public async Task<IActionResult> ImportarExcel()
    {
        var path = GetArribosPath();
        if (!System.IO.File.Exists(path))
            return NotFound(new { error = "Arribos.xlsx no encontrado en ~/Downloads" });

        var skusList = await _context.Productos.Select(p => p.Sku.Trim()).ToListAsync();
        var skusValidos = new HashSet<string>(skusList, StringComparer.OrdinalIgnoreCase);

        var contenedoresList = await _context.Arribos.Select(a => a.Contenedor.Trim()).ToListAsync();
        var contenedoresExistentes = new HashSet<string>(contenedoresList, StringComparer.OrdinalIgnoreCase);

        using var wb = new XLWorkbook(path);
        var ws = wb.Worksheets.First();

        var grupos = ws.RowsUsed().Skip(1)
            .Select(row => new
            {
                Contenedor = row.Cell(11).Value.ToString().Trim(),
                PO         = row.Cell(2).Value.ToString().Trim(),
                Sku        = row.Cell(5).Value.ToString().Trim(),
                Cantidad   = row.Cell(8).Value.IsNumber ? (int)row.Cell(8).Value.GetNumber() : 0,
                Estatus    = row.Cell(16).Value.ToString().Trim()
            })
            .Where(r => !string.IsNullOrEmpty(r.Contenedor))
            .Where(r => r.Estatus == "CONCLUIDO" || r.Estatus == "PENDIENTE MODULAR")
            .GroupBy(r => r.Contenedor);

        int nuevos = 0, omitidos = 0, detallesInsertados = 0, skusSinCatalogo = 0;

        foreach (var grupo in grupos)
        {
            if (contenedoresExistentes.Contains(grupo.Key))
            {
                omitidos++;
                continue;
            }

            var arribo = new Arribo { Contenedor = grupo.Key, Proveedor = string.Empty };
            _context.Arribos.Add(arribo);
            await _context.SaveChangesAsync();

            foreach (var fila in grupo)
            {
                if (!skusValidos.Contains(fila.Sku))
                {
                    skusSinCatalogo++;
                    continue;
                }
                _context.ArriboDetalles.Add(new ArriboDetalle
                {
                    ArriboId    = arribo.Id,
                    PO          = fila.PO,
                    SkuProducto = fila.Sku,
                    Cantidad    = fila.Cantidad
                });
                detallesInsertados++;
            }
            await _context.SaveChangesAsync();
            nuevos++;
        }

        return Ok(new { nuevos, omitidos, detallesInsertados, skusSinCatalogo });
    }

    [HttpGet("skus-sin-catalogo")]
    public async Task<IActionResult> GetSkusSinCatalogo()
    {
        var path = GetArribosPath();
        if (!System.IO.File.Exists(path))
            return NotFound(new { error = "Arribos.xlsx no encontrado en ~/Downloads" });

        var skusList = await _context.Productos.Select(p => p.Sku.Trim()).ToListAsync();
        var skusValidos = new HashSet<string>(skusList, StringComparer.OrdinalIgnoreCase);

        using var wb = new XLWorkbook(path);
        var ws = wb.Worksheets.First();

        var faltantes = ws.RowsUsed().Skip(1)
            .Select(row => new
            {
                Contenedor   = row.Cell(11).Value.ToString().Trim(),
                PO           = row.Cell(2).Value.ToString().Trim(),
                Sku          = row.Cell(5).Value.ToString().Trim(),
                Descripcion  = row.Cell(6).Value.ToString().Trim(),
                Cantidad     = row.Cell(8).Value.ToString().Trim(),
                Estatus      = row.Cell(16).Value.ToString().Trim()
            })
            .Where(r => !string.IsNullOrEmpty(r.Sku))
            .Where(r => r.Estatus == "CONCLUIDO" || r.Estatus == "PENDIENTE MODULAR")
            .Where(r => !skusValidos.Contains(r.Sku))
            .DistinctBy(r => r.Sku)
            .OrderBy(r => r.Sku)
            .ToList();

        using var reporte = new XLWorkbook();
        var hoja = reporte.Worksheets.Add("SKUs Sin Catalogo");
        hoja.Cell(1, 1).Value = "SKU";
        hoja.Cell(1, 2).Value = "Descripción (Excel)";
        hoja.Cell(1, 3).Value = "PO";
        hoja.Cell(1, 4).Value = "Contenedor";
        hoja.Cell(1, 5).Value = "Cantidad";
        hoja.Row(1).Style.Font.Bold = true;

        for (int i = 0; i < faltantes.Count; i++)
        {
            var f = faltantes[i];
            hoja.Cell(i + 2, 1).Value = f.Sku;
            hoja.Cell(i + 2, 2).Value = f.Descripcion;
            hoja.Cell(i + 2, 3).Value = f.PO;
            hoja.Cell(i + 2, 4).Value = f.Contenedor;
            hoja.Cell(i + 2, 5).Value = f.Cantidad;
        }
        hoja.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        reporte.SaveAs(stream);
        stream.Seek(0, SeekOrigin.Begin);

        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "skus-sin-catalogo.xlsx");
    }

    [HttpGet("contenedor/{numeroContenedor}")]
    public async Task<IActionResult> GetPorContenedor(string numeroContenedor)
    {
        var arribo = await _context.Arribos
            .Include(a => a.Detalles)
            .FirstOrDefaultAsync(a => a.Contenedor.Trim() == numeroContenedor.Trim());

        if (arribo == null)
            return NotFound(new { error = $"Contenedor '{numeroContenedor}' no encontrado. Ejecute primero POST /api/arribos/importar." });

        return Ok(new
        {
            arriboId         = arribo.Id,
            numeroContenedor = arribo.Contenedor,
            estatus          = "CONCLUIDO",
            detalles         = arribo.Detalles.Select(d => new
            {
                arriboDetalleId = d.Id,
                ordenCompra     = d.PO,
                codigo          = d.SkuProducto,
                cantidad        = d.Cantidad
            })
        });
    }
}
