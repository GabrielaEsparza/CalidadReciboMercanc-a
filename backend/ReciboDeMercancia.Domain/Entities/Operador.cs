namespace ReciboDeMercancia.Domain.Entities;

public class Operador
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty; // Agregado para diferenciar roles (operadorCQ, operador, etc.)


}
