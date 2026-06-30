namespace ReciboDeMercancia.Domain.Entities;

public class Arribo
{
    public int Id { get; set; }
    public string Contenedor { get; set; } = string.Empty;
    public string Proveedor { get; set; } = string.Empty;
    public ICollection<ArriboDetalle> Detalles { get; set; } = new List<ArriboDetalle>();
}
