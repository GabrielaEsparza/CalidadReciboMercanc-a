namespace ReciboDeMercancia.Domain.Entities;

public class OrdenDeCompra
{
    public int Id { get; set; }
    public string NumeroDeOrden { get; set; } = string.Empty;
    public string NombreProveedor { get; set; } = string.Empty;

    // A qué contenedor pertenece esta orden
    public string NumeroContenedor { get; set; } = string.Empty;
    public Contenedor Contenedor { get; set; } = null!;

    // Productos que vienen en esta orden
    public ICollection<OrdenDeCompraDetalle> Detalles { get; set; } = new List<OrdenDeCompraDetalle>();
}