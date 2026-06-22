namespace ReciboDeMercancia.Domain.Entities;

public class EntradaDeImportacion
{
    public int Id { get; set; }
    public string Situacion { get; set; } = string.Empty;
    // 👇 Agrega esta línea
    public string Estatus { get; set; } = "AFECTADO"; 
    public string Proveedor { get; set; } = string.Empty;

    public string OrdenCompra { get; set; } = string.Empty;
    public string Usuario    { get; set; } = string.Empty;

    public DateTime? Fecha { get; set; }

    public string NumeroContenedor  { get; set; } = string.Empty;
    public Contenedor Contenedor { get; set; } = null!;

    // Lista de productos que vienen en esta entrada de importación:
    // Permite navegar desde la entrada hacia sus líneas de detalle sin queries adicionales.
    public ICollection<EntradaDeImportacionDetalle> Detalles { get; set; } = new List<EntradaDeImportacionDetalle>();
}
 