namespace ReciboDeMercancia.Domain.Entities;

public class Recepcion
{
    public int Id { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public EstadoRecepcion Estado { get; set; }

    // Qué contenedor llegó
    public int ContenedorId { get; set; }
    public Contenedor Contenedor { get; set; } = null!;

    // Quién supervisó
    public int OperadorQCId { get; set; }
    public Operador OperadorQC { get; set; } = null!;

    // Quiénes descargaron
    public ICollection<RecepcionOperador> Operadores { get; set; } = new List<RecepcionOperador>();

    // Productos escaneados
    public ICollection<RecepcionDetalle> Detalles { get; set; } = new List<RecepcionDetalle>();

    // Problemas encontrados
    public ICollection<Incidencia> Incidencias { get; set; } = new List<Incidencia>();
}