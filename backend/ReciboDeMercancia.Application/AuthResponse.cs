namespace ReciboDeMercancia.Application.DTOs;

public class AuthResponse
{
    public bool Exito { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}
