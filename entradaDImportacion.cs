// ErpConnection.cs
using System.Data;
using System.Data.Odbc;
using Dapper;
using DotNetEnv;

Env.Load();

string cadenaConexion = 
    $"Driver={{SQL Server}};" +
    $"Server={Environment.GetEnvironmentVariable("ERP_HOST")};" +
    $"Database={Environment.GetEnvironmentVariable("ERP_NAME")};" +
    $"UID={Environment.GetEnvironmentVariable("ERP_USER")};" +
    $"PWD={Environment.GetEnvironmentVariable("ERP_PASSWORD")};" +
    $"Timeout=10;";

IDbConnection ConectarErp() => new OdbcConnection(cadenaConexion);


// EntradaImportacion.cs
public class EntradaImportacion
{
    public int Id { get; set; }
    public string Mov { get; set; }
    public string? MovId { get; set; }
    public string Referencia { get; set; }
    public string Estatus { get; set; }
    public string? Situacion { get; set; }
    public string Proveedor { get; set; }
    public string CFDIRetBeneficiarioNombre { get; set; }
    public DateOnly Fecha { get; set; }
    public string Articulo { get; set; }
    public string Descripcion { get; set; }
    public decimal Cantidad { get; set; }
    public string Origen { get; set; }
    public string OrigenId { get; set; }
}


// Program.cs
using (var conn = ConectarErp())
{
    var sql = """
        SELECT TOP 10
            c.id, c.mov, c.movid, c.Referencia, c.Estatus, c.Situacion,
            c.proveedor, p.Nombre as CFDIRetBeneficiarioNombre,
            CAST(C.FechaEmision AS DATE) as Fecha,
            CD.Articulo, a.Descripcion1 as Descripcion,
            CD.Cantidad, c.origen, c.origenid
        FROM compra c
        LEFT JOIN comprad cd ON c.id = cd.ID
        LEFT JOIN Prov p ON c.proveedor = p.proveedor
        LEFT JOIN art a ON cd.articulo = a.Articulo
        WHERE c.mov IN ('Entrada Importacion')
        AND YEAR(C.FechaEmision) >= 2025
        AND c.Estatus IN ('SINAFECTAR')
    """;

    var resultados = conn.Query<EntradaImportacion>(sql).ToList();

    foreach (var entrada in resultados)
    {
        Console.WriteLine($"{entrada.Id} | {entrada.Mov} | {entrada.Referencia} | " +
                          $"{entrada.CFDIRetBeneficiarioNombre} | {entrada.Fecha} | " +
                          $"{entrada.Articulo} | {entrada.Descripcion} | {entrada.Cantidad}");
    }

    Console.WriteLine($"\nTotal: {resultados.Count} registros");
}