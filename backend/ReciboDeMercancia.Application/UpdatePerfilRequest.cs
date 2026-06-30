namespace ReciboDeMercancia.Application.DTOs;

public class UpdatePerfilRequest
{
    public string PasswordActual { get; set; } = string.Empty;
    public string? NuevoNombre { get; set; }
    public string? NuevaPassword { get; set; }
}
