namespace ReciboDeMercancia.Domain.Entities;
public class RecepcionOperador
{
    public int Id {get; set;}
    


    //A   qué Recepción pertenece esta relación?
    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;

    //Qué Operador descargó?
    public int OperadorId {get; set;}
    public Operador Operador { get; set; } = null!;

    
}