using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Infrastructure.Data;

namespace ReciboDeMercancia.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{sku}")]
    public async Task<IActionResult> GetBySku(string sku)
    {
        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.Sku.Trim() == sku.Trim());

        if (producto is null)
            return NotFound(new { error = $"Producto '{sku}' no encontrado" });

        return Ok(producto);
    }
}
