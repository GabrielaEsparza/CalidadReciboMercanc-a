namespace ReciboDeMercancia.Domain.Entities;

public class EntradaDeImportacion
{
    public int Id { get; set; }
    public string Situacion { get; set; } = string.Empty;
    public string Proveedor { get; set; } = string.Empty;
    public string IdContenedor { get; set; } = string.Empty;
    public string OrdenCompra { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}
