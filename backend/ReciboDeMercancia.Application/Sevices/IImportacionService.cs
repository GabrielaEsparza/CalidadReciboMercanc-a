using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReciboDeMercancia.Application.Services;

public interface IImportacionService
{
    // Definimos el método que usará el controlador
    Task<IEnumerable<dynamic>> ObtenerTablasLocalAsync();
}