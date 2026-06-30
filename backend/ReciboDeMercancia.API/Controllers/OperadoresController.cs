using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Application.Services;
using ReciboDeMercancia.Domain.Entities;
using ReciboDeMercancia.Infrastructure.Data;

namespace ReciboDeMercancia.API.Controllers;

public record CrearOperadorDto(string Name, string Password, string Rol);

[ApiController]
[Route("api/[controller]")]
public class OperadoresController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public OperadoresController(AppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var ops = await _context.Operadores
            .Select(o => new { o.Id, o.Name, o.Rol })
            .ToListAsync();
        return Ok(ops);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearOperadorDto dto)
    {
        var existe = await _context.Operadores.AnyAsync(o => o.Name == dto.Name);
        if (existe)
            return Conflict(new { error = $"Operador '{dto.Name}' ya existe." });

        var operador = new Operador
        {
            Name     = dto.Name,
            Password = _passwordService.HashPassword(dto.Password),
            Rol      = dto.Rol
        };
        _context.Operadores.Add(operador);
        await _context.SaveChangesAsync();
        return Ok(new { id = operador.Id, name = operador.Name, rol = operador.Rol });
    }
}
