namespace ReciboDeMercancia.Domain.Entities;

public class EntradaDeImportacionDetalle
{
    public int Id { get; set; }
    public int EntradaDeImportacionId { get; set; }
    public int ProductId { get; set; }
    public decimal Cantidad { get; set; }
}
