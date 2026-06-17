using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ReciboDeMercancia.Application.DTOs;
using ReciboDeMercancia.Infrastructure.Data; // Asegúrate de apuntar a tu DbContext

namespace ReciboDeMercancia.Application.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IPasswordService passwordService, IConfiguration configuration)
    {
        _context = context;
        _passwordService = passwordService;
        _configuration = configuration;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // LOG DE CONTROL
        //Console.WriteLine($"[AUTH_DEBUG] Intentando login con el usuario recibido: '{request.Name}'");

        var operador = await _context.Operadores
            .FirstOrDefaultAsync(o => o.Name == request.Name);

        if (operador == null)
        {
            return new AuthResponse { Exito = false, Mensaje = "El usuario no existe." };
        }

        
        bool passwordValido = _passwordService.VerifyPassword(request.Password, operador.Password);
        if (!passwordValido)
        {
            return new AuthResponse { Exito = false, Mensaje = "Contraseña incorrecta." };
        }

        var token = GenerarJwtToken(operador.Name, operador.Rol); 
        return new AuthResponse { Exito = true, Token = token, Mensaje = "Login exitoso." };
    }

    private string GenerarJwtToken(string nombre, string rol)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, nombre),
            new Claim(ClaimTypes.Role, rol), // <-- 'ClaimTypes.Role' es la etiqueta de .NET, 'rol' es tu variable con el texto "operador"
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Obtenemos una clave secreta desde el appsettings.json o variables de entorno
        var jwtKey = _configuration["Jwt:Key"] ?? "TuSuperClaveSecretaDeMasDe32CaracteresAca!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "ReciboAPI",
            audience: _configuration["Jwt:Audience"] ?? "ReciboClientes",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8), // El token expira en 8 horas
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

}
