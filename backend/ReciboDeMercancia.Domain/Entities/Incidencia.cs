namespace ReciboDeMercancia.Domain.Entities;

public class Incidencia
{
    public int Id { get; set; }
    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;
    public string SkuProducto { get; set; } = string.Empty;
    public Producto? Producto { get; set; }
    public int? ArriboDetalleId { get; set; }
    public ArriboDetalle? ArriboDetalle { get; set; }
    public string? NumeroSerie { get; set; }
    public string TipoIncidencia { get; set; } = string.Empty;
    public string? Observacion { get; set; }
    public string? EvidenciaFoto { get; set; }
}
