namespace ReciboDeMercancia.Domain.Entities;

public class Recepcion
{
    public int Id { get; set; }
    public int ArriboId { get; set; }
    public Arribo Arribo { get; set; } = null!;
    public int OperadorId { get; set; }
    public Operador Operador { get; set; } = null!;
    public DateTime FechaYHoraLlegada { get; set; }
    public ICollection<Incidencia> Incidencias { get; set; } = new List<Incidencia>();
    public ICollection<RecepcionDetalle> Detalles { get; set; } = new List<RecepcionDetalle>();
}
