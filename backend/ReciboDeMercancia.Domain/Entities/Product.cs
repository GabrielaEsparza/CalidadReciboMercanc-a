namespace ReciboDeMercancia.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public int Upc { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal? AltoProducto { get; set; }
    public decimal? AnchoProducto { get; set; }
    public decimal? LargoProducto { get; set; }
    public decimal Peso { get; set; }
}
