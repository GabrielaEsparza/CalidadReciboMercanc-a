namespace ReciboDeMercancia.Domain.Entities;

public class OrdenDeCompra
{
    public int Id { get; set; }
    public string NumeroDeOrden { get; set; } = string.Empty;
    public string NombreProveedor { get; set; } = string.Empty;
}
