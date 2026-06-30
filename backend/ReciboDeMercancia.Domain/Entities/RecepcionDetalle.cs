namespace ReciboDeMercancia.Domain.Entities;

public class RecepcionDetalle
{
    public int Id { get; set; }
    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;
    public string SkuProducto { get; set; } = string.Empty;
    public int CantidadRecibida { get; set; }
}
