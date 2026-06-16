using Dapper;
using System.Data.Odbc;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Infrastructure.Data;

DotNetEnv.Env.Load("./env");

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();

// Configuración de MySQL con EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();

// Endpoint GET /entradas
app.MapGet("/entradas", () =>
{
    var connStr =
        $"Driver={{SQL Server}};" +
        $"Server={Environment.GetEnvironmentVariable("ERP_HOST")};" +
        $"Database={Environment.GetEnvironmentVariable("ERP_NAME")};" +
        $"UID={Environment.GetEnvironmentVariable("ERP_USER")};" +
        $"PWD={Environment.GetEnvironmentVariable("ERP_PASSWORD")};" +
        $"Timeout=10;";

    using var conn = new OdbcConnection(connStr);
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

    var resultados = conn.Query(sql).ToList();
    return Results.Ok(resultados);
});

app.Run();