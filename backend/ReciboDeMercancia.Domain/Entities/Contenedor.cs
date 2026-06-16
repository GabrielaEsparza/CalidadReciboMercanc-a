namespace ReciboDeMercancia.Domain.Entities;

public class Contenedor
{
    public int Id { get; set; }
    public string NumeroContenedor { get; set; } = string.Empty;
    public DateTime? FechaLlegada { get; set; }
    public EstadoContenedor Estado { get; set; }

    // Órdenes de compra que vienen en este contenedor
    public ICollection<OrdenDeCompra> OrdenesDeCompra { get; set; } = new List<OrdenDeCompra>();

    // Recepción asociada a este contenedor
    public Recepcion? Recepcion { get; set; }
}