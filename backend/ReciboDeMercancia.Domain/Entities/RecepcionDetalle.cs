namespace ReciboDeMercancia.Domain.Entities;

public class RecepcionDetalle
{
    public int Id { get; set; }

    // Cantidad que se esperaba según la orden de compra
    public decimal CantidadEsperada { get; set; }

    // Cantidad que realmente llegó (se va sumando conforme escanean)
    public decimal CantidadRecibida { get; set; }

    // Si ya se midió y pesó la primera caja de este SKU
    public bool PrimeraCajaValidada { get; set; }

    // Recepción a la que pertenece este detalle
    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;

    // Producto que se está escaneando
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    // Medición de la primera caja (solo existe si PrimeraCajaValidada es true)
    public ValidacionCaja? ValidacionCaja { get; set; }
}