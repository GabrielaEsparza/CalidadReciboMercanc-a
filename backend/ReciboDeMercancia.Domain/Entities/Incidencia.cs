namespace ReciboDeMercancia.Domain.Entities;

public class Incidencia
{
    public int Id { get; set; }

    public TipoIncidencia Tipo { get; set; }

    public decimal CantidadAfectada { get; set; }

    public string? Descripcion { get; set; }

    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}