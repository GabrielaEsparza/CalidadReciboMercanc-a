namespace ReciboDeMercancia.Domain.Entities;

public class Recepcion
{
    public int Id {get; set;}
    public DateTime FechaInicio {get; set;}
    public DateTime? FechaFin {get; set;}
    public EstadoRecepcion Estado {get; set;}


    //Qué contenedor llegó:

    public int NumeroContenedor { get; set; }
    public Contenedor Contenedor { get; set; } = null!;

    //Quién supervisó?
    public int OperadorQCId { get; set; }
    public Operador OperadorQC { get; set; } = null!;

    //Quienes descargaron?
    public ICollection<RecepcionOperador> RecepcionOperadores { get; set; } = new List<RecepcionOperador>();




}