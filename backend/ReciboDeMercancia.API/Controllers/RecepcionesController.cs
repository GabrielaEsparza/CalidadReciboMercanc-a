using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Domain.Entities;
using ReciboDeMercancia.Infrastructure.Data;

namespace ReciboDeMercancia.API.Controllers;

public record IncidenciaDto(string Tipo, string? Descripcion, string? NumeroSerie);
public record SkuEscaneadoDto(int? ArriboDetalleId, string Sku, List<IncidenciaDto> Incidencias);
public record CrearRecepcionDto(int ArriboId, int OperadorId, List<SkuEscaneadoDto> SkusEscaneados);

[ApiController]
[Route("api/[controller]")]
public class RecepcionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RecepcionesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearRecepcionDto dto)
    {
        var arriboExiste = await _context.Arribos.AnyAsync(a => a.Id == dto.ArriboId);
        if (!arriboExiste)
            return BadRequest(new { error = $"Arribo {dto.ArriboId} no existe." });

        var operadorExiste = await _context.Operadores.AnyAsync(o => o.Id == dto.OperadorId);
        if (!operadorExiste)
            return BadRequest(new { error = $"Operador {dto.OperadorId} no existe." });

        var recepcion = new Recepcion
        {
            ArriboId          = dto.ArriboId,
            OperadorId        = dto.OperadorId,
            FechaYHoraLlegada = DateTime.UtcNow
        };
        _context.Recepciones.Add(recepcion);
        await _context.SaveChangesAsync();

        foreach (var sku in dto.SkusEscaneados)
        {
            foreach (var inc in sku.Incidencias)
            {
                _context.Incidencias.Add(new Incidencia
                {
                    RecepcionId     = recepcion.Id,
                    SkuProducto     = sku.Sku,
                    ArriboDetalleId = sku.ArriboDetalleId,
                    TipoIncidencia  = inc.Tipo,
                    Observacion     = inc.Descripcion,
                    NumeroSerie     = inc.NumeroSerie
                });
            }
        }

        var detallesPorSku = dto.SkusEscaneados
            .GroupBy(s => s.Sku)
            .Select(g => new RecepcionDetalle
            {
                RecepcionId      = recepcion.Id,
                SkuProducto      = g.Key,
                CantidadRecibida = g.Count()
            });
        _context.RecepcionesDetalle.AddRange(detallesPorSku);

        await _context.SaveChangesAsync();

        return Ok(new { recepcionId = recepcion.Id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var recepciones = await _context.Recepciones
            .Include(r => r.Arribo)
            .Include(r => r.Operador)
            .Include(r => r.Incidencias)
            .Include(r => r.Detalles)
            .OrderByDescending(r => r.FechaYHoraLlegada)
            .Select(r => new
            {
                id               = r.Id,
                arriboId         = r.ArriboId,
                contenedor       = r.Arribo.Contenedor,
                operador         = r.Operador.Name,
                fechaLlegada     = r.FechaYHoraLlegada,
                totalUnidades    = r.Detalles.Sum(d => d.CantidadRecibida),
                totalIncidencias = r.Incidencias.Count,
                detalles         = r.Detalles.Select(d => new
                {
                    d.SkuProducto,
                    d.CantidadRecibida
                }),
                incidencias      = r.Incidencias.Select(i => new
                {
                    i.Id,
                    i.SkuProducto,
                    i.TipoIncidencia,
                    i.Observacion,
                    i.NumeroSerie
                })
            })
            .ToListAsync();

        return Ok(recepciones);
    }
}
