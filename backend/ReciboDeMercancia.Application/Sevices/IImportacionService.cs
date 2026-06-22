using System.Collections.Generic;
using System.Threading.Tasks;
using ReciboDeMercancia.Domain.Entities; 

namespace ReciboDeMercancia.Application.Services;

public interface IImportacionService
{
    // Definimos el método que usará el controlador
    Task<IEnumerable<EntradaDeImportacion>> ObtenerTablasLocalAsync();

}