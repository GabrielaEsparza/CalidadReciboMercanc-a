using Microsoft.AspNetCore.Mvc;
using ReciboDeMercancia.Application.Services;
using System.Threading.Tasks;

namespace ReciboDeMercancia.API.Controllers;

[ApiController]
[Route("api/[controller]")] 
public class ImportacionController : ControllerBase
{
    private readonly IImportacionService _importacionService;

    public ImportacionController(IImportacionService importacionService)
    {
        _importacionService = importacionService;
    }

     [HttpGet("tablas_local")]
    public async Task<IActionResult> GetTablasLocal()
    {
        var resultado = await _importacionService.ObtenerTablasLocalAsync();
        return Ok(resultado);
    }

    [HttpGet("tablas_local/buscar")]
    public async Task<IActionResult> GetPorFiltros([FromQuery] string? contenedor, [FromQuery] string? po)
    {
        var resultado = await _importacionService.ObtenerPorFiltrosAsync(contenedor, po);
        if (resultado is null)
            return NotFound();
        return Ok(resultado);
    }
}