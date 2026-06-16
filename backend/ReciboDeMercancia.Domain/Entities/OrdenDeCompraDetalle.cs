namespace ReciboDeMercancia.Domain.Entities;

public class OrdenDeCompraDetalle
{
    public int Id { get; set; }

    // Cantidad esperada de este producto
    public decimal Cantidad { get; set; }

    // A qué orden de compra pertenece
    public string NumeroDeOrden { get; set; }
    public OrdenDeCompra OrdenDeCompra { get; set; } = null!;

    // Qué producto es
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}