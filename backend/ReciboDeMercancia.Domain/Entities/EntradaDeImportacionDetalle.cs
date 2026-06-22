using System.ComponentModel.DataAnnotations.Schema; // <-- AGREGADO
using System.Text.Json.Serialization; // <-- AGREGADO

namespace ReciboDeMercancia.Domain.Entities;

public class EntradaDeImportacionDetalle
{
    public int Id { get; set; }
    public decimal Cantidad { get; set; }
    public int EntradaDeImportacionId { get; set; }
    [ForeignKey("EntradaDeImportacionId")]
    [JsonIgnore]
    public EntradaDeImportacion EntradaDeImportacion { get; set; } = null!;

    // FK hacia producto (Debe coincidir con el ID entero que genera tu tabla 'products')
    public int ProductId { get; set; }
    [ForeignKey("ProductId")]
    public Product Product { get; set; } = null!;
}
