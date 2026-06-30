namespace ReciboDeMercancia.Domain.Entities;

public class ArriboDetalle
{
    public int Id { get; set; }
    public int ArriboId { get; set; }
    public Arribo Arribo { get; set; } = null!;
    public string PO { get; set; } = string.Empty;
    public string SkuProducto { get; set; } = string.Empty;
    public Producto Producto { get; set; } = null!;
    public int Cantidad { get; set; }
}
