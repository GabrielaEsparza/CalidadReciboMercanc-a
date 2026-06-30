namespace ReciboDeMercancia.Domain.Entities;

public class Producto
{
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public long Upc { get; set; }
    public decimal? AltoProducto { get; set; }
    public decimal? AnchoProducto { get; set; }
    public decimal? LargoProducto { get; set; }
    public decimal Peso { get; set; }
}
