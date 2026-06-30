using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Domain.Entities;
using ReciboDeMercancia.Infrastructure.Data;

namespace ReciboDeMercancia.Application.Services;

public class ImportacionService : IImportacionService
{
    private readonly AppDbContext _context;

    public ImportacionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Arribo>> ObtenerTablasLocalAsync()
    {
        return await _context.Arribos
            .Include(a => a.Detalles)
            .OrderByDescending(a => a.Id)
            .ToListAsync();
    }

    public async Task<Arribo?> ObtenerPorFiltrosAsync(string? contenedor, string? po)
    {
        var query = _context.Arribos.Include(a => a.Detalles).AsQueryable();

        if (!string.IsNullOrWhiteSpace(contenedor))
            query = query.Where(a => a.Contenedor.Trim() == contenedor.Trim());

        if (!string.IsNullOrWhiteSpace(po))
            query = query.Where(a => a.Detalles.Any(d => d.PO.Trim() == po.Trim()));

        return await query.FirstOrDefaultAsync();
    }
}
