using ReciboDeMercancia.Domain.Entities;

namespace ReciboDeMercancia.Application.Services;

public interface IImportacionService
{
    Task<IEnumerable<Arribo>> ObtenerTablasLocalAsync();
    Task<Arribo?> ObtenerPorFiltrosAsync(string? contenedor, string? po);
}
