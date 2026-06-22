using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

   public async Task<IEnumerable<EntradaDeImportacion>> ObtenerTablasLocalAsync()
    {
        // Al agregar .OrderByDescending(e => e.Id), los registros con ID 2494+ saldrán al principio
        return await _context.EntradasDeImportacion
            .Include(e => e.Detalles)
            .OrderByDescending(e => e.Id) 
            .ToListAsync();
    }

}

