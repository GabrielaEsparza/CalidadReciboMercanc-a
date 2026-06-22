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
        return Ok(resultado); // Reemplaza al Results.Ok()
    }
}