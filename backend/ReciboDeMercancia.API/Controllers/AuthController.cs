using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using ReciboDeMercancia.Application.DTOs;
using ReciboDeMercancia.Application.Services;

namespace ReciboDeMercancia.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var resultado = await _authService.LoginAsync(request);

        if (!resultado.Exito)
            return Unauthorized(new { mensaje = resultado.Mensaje });

        return Ok(resultado);
    }

    [HttpPut("perfil")]
    public async Task<IActionResult> UpdatePerfil([FromBody] UpdatePerfilRequest request)
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader == null || !authHeader.StartsWith("Bearer "))
            return Unauthorized(new { mensaje = "Token requerido." });

        var token = authHeader["Bearer ".Length..];
        var handler = new JwtSecurityTokenHandler();
        JwtSecurityToken jwtToken;
        try
        {
            jwtToken = handler.ReadJwtToken(token);
        }
        catch
        {
            return Unauthorized(new { mensaje = "Token inválido." });
        }

        var nombreActual = jwtToken.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

        if (string.IsNullOrEmpty(nombreActual))
            return Unauthorized(new { mensaje = "Token no contiene usuario." });

        var resultado = await _authService.UpdatePerfilAsync(nombreActual, request);

        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });

        return Ok(resultado);
    }
}
