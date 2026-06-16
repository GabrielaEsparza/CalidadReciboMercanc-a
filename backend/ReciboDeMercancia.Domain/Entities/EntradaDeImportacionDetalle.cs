namespace ReciboDeMercancia.Domain.Entities;

public class EntradaDeImportacionDetalle
{
    public int Id { get; set; }
    public decimal Cantidad { get; set; }

    //FK hacia entrada de importacion
    public int EntradaDeImportacionId { get; set; }
    public EntradaDeImportacion EntradaDeImportacion { get; set; } = null!;

    //FK hacia producto
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
}