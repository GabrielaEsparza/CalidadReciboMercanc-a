namespace ReciboDeMercancia.Domain.Entities;

public class ValidacionCaja
{
    public int Id { get; set; }
    public decimal PesoReal { get; set; }
    public decimal PesoEsperado { get; set; }
    public decimal AltoReal { get; set; }
    public decimal AnchoReal { get; set; }
    public decimal LargoReal { get; set; }
    public bool Aprobada { get; set; }
    public string? Observaciones { get; set; }

    // A qué RecepcionDetalle pertenece esta validación
    public int RecepcionDetalleId { get; set; }
    public RecepcionDetalle RecepcionDetalle { get; set; } = null!;
}