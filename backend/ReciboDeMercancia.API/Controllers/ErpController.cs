using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data.Odbc;
using System.Threading.Tasks;

namespace ReciboDeMercancia.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ErpController : ControllerBase
{
    private string GetConnectionString()
    {
        return $"Driver={{SQL Server}};" +
               $"Server={Environment.GetEnvironmentVariable("ERP_HOST")};" +
               $"Database={Environment.GetEnvironmentVariable("ERP_NAME")};" +
               $"UID={Environment.GetEnvironmentVariable("ERP_USER")};" +
               $"PWD={Environment.GetEnvironmentVariable("ERP_PASSWORD")};" +
               $"Timeout=10;";
    }

    [HttpGet("tablas")]
    public async Task<IActionResult> GetTablas()
    {
        try
        {
            using var conn = new OdbcConnection(GetConnectionString());
            var sql = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;";
            var tablas = (await conn.QueryAsync<string>(sql)).ToList();
            return Ok(new { total = tablas.Count, tablas });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("tabla/{nombreTabla}/estructura")]
    public async Task<IActionResult> GetEstructuraTabla(string nombreTabla)
    {
        try
        {
            using var conn = new OdbcConnection(GetConnectionString());
            // Sanitizar nombre de tabla
            nombreTabla = System.Text.RegularExpressions.Regex.Replace(nombreTabla, @"[^a-zA-Z0-9_]", "");
            var sql = $"""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '{nombreTabla}'
                ORDER BY ORDINAL_POSITION;
                """;
            var columnas = (await conn.QueryAsync<dynamic>(sql)).ToList();
            return Ok(new { tabla = nombreTabla, total = columnas.Count, columnas });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("compras")]
    public async Task<IActionResult> GetCompras([FromQuery] int? limit = 100, [FromQuery] string? filtroMovimiento = null)
    {
        try
        {
            using var conn = new OdbcConnection(GetConnectionString());

            string sql;
            object? parameters = null;

            if (!string.IsNullOrWhiteSpace(filtroMovimiento))
            {
                sql = $"""
                    SELECT TOP {limit}
                        c.id, c.mov, c.movid, c.Referencia, c.Estatus, c.Situacion,
                        c.proveedor, p.Nombre as NombreProveedor,
                        CAST(c.FechaEmision AS DATE) as Fecha,
                        c.origen, c.origenid
                    FROM compra c
                    LEFT JOIN Prov p ON c.proveedor = p.proveedor
                    WHERE c.mov LIKE @mov
                    ORDER BY c.id DESC;
                    """;
                parameters = new { mov = $"%{filtroMovimiento}%" };
            }
            else
            {
                sql = $"""
                    SELECT TOP {limit}
                        c.id, c.mov, c.movid, c.Referencia, c.Estatus, c.Situacion,
                        c.proveedor, p.Nombre as NombreProveedor,
                        CAST(c.FechaEmision AS DATE) as Fecha,
                        c.origen, c.origenid
                    FROM compra c
                    LEFT JOIN Prov p ON c.proveedor = p.proveedor
                    ORDER BY c.id DESC;
                    """;
            }

            var resultados = (await conn.QueryAsync<dynamic>(sql, parameters)).ToList();
            return Ok(new { total = resultados.Count, data = resultados });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("compra/{id}/detalles")]
    public async Task<IActionResult> GetDetallesCompra(string id)
    {
        try
        {
            using var conn = new OdbcConnection(GetConnectionString());

            var sqlCabecera = """
                SELECT c.id, c.mov, c.movid, c.Referencia, c.Estatus, c.Situacion,
                       c.proveedor, p.Nombre as NombreProveedor,
                       CAST(c.FechaEmision AS DATE) as Fecha
                FROM compra c
                LEFT JOIN Prov p ON c.proveedor = p.proveedor
                WHERE c.id = @id;
                """;

            var sqlDetalles = """
                SELECT cd.ID, cd.Articulo, a.Descripcion1 as Descripcion,
                       cd.Cantidad, cd.Precio, cd.Importe,
                       a.AltoPieza, a.AnchoPieza, a.LargoPieza, a.PesoPieza, a.ISBN as UPC
                FROM comprad cd
                LEFT JOIN art a ON cd.articulo = a.Articulo
                WHERE cd.ID = @id;
                """;

            var paramId = new { id };
            var cabecera = (await conn.QueryAsync<dynamic>(sqlCabecera, paramId)).FirstOrDefault();
            if (cabecera == null)
                return NotFound(new { error = "Compra no encontrada" });

            var detalles = (await conn.QueryAsync<dynamic>(sqlDetalles, paramId)).ToList();

            return Ok(new { cabecera, detalles });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("articulos")]
    public async Task<IActionResult> GetArticulos([FromQuery] int? limit = 100, [FromQuery] string? filtroSku = null)
    {
        try
        {
            using var conn = new OdbcConnection(GetConnectionString());

            string sql;
            object? parameters = null;

            if (!string.IsNullOrWhiteSpace(filtroSku))
            {
                sql = $"""
                    SELECT TOP {limit}
                        a.Articulo as SKU,
                        a.Descripcion1 as Descripcion,
                        a.ISBN as UPC,
                        a.AltoPieza as Alto,
                        a.AnchoPieza as Ancho,
                        a.LargoPieza as Largo,
                        a.PesoPieza as Peso,
                        a.Rama as Rama
                    FROM art a
                    WHERE a.Rama = 'PRODUCTO' AND a.Articulo LIKE @sku
                    ORDER BY a.Articulo;
                    """;
                parameters = new { sku = $"%{filtroSku}%" };
            }
            else
            {
                sql = $"""
                    SELECT TOP {limit}
                        a.Articulo as SKU,
                        a.Descripcion1 as Descripcion,
                        a.ISBN as UPC,
                        a.AltoPieza as Alto,
                        a.AnchoPieza as Ancho,
                        a.LargoPieza as Largo,
                        a.PesoPieza as Peso,
                        a.Rama as Rama
                    FROM art a
                    WHERE a.Rama = 'PRODUCTO'
                    ORDER BY a.Articulo;
                    """;
            }

            var resultados = (await conn.QueryAsync<dynamic>(sql, parameters)).ToList();
            return Ok(new { total = resultados.Count, data = resultados });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
