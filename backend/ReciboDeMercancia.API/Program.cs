using Dapper;
using System.Data.Odbc;
using DotNetEnv;
using ReciboDeMercancia.Application.Services;
using ReciboDeMercancia.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

// 1. Cargar variables de entorno del archivo .env
DotNetEnv.Env.Load("./env");

var builder = WebApplication.CreateBuilder(args);

// 2. Servicios base del sistema
builder.Services.AddOpenApi();
builder.Services.AddControllers();

// 3. CONFIGURACIÓN DE CORS: Permite que tu frontend de React (puerto 5173) acceda a la API
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // URL exacta de tu frontend de Vite/React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 4. Registrar el AppDbContext conectado a MySQL
var connectionString = $"Server={Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost"};" +
                       $"Port=3306;" +
                       $"Database=recibo_mercancia_db;" +
                       $"Uid={Environment.GetEnvironmentVariable("DB_USER") ?? "root"};" +
                       $"Pwd={Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "Passw0rd1"};";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

// 5. Inyección de dependencias para los servicios de Autenticación
builder.Services.AddSingleton<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();

// 6. ¡CRÍTICO! Habilitar el middleware de CORS antes de mapear los controladores
app.UseCors("PermitirFrontend");

// 7. Mapear las rutas de los controladores convencionales (Activa /api/auth/login)
app.MapControllers();

// Endpoint GET /entradas (Tu motor rápido de Dapper para el ERP)
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

// Endpoint temporal para dar de alta o actualizar al admin con el hash nativo
app.MapPost("/api/auth/setup-admin", async (AppDbContext context, IPasswordService passwordService) =>
{
    var adminExistente = await context.Operadores.FirstOrDefaultAsync(o => o.Name == "admin");
    string nuevoHash = passwordService.HashPassword("admin123");

    if (adminExistente != null)
    {
        adminExistente.Password = nuevoHash;
        await context.SaveChangesAsync();
        return Results.Ok(new { mensaje = "Password de 'admin' actualizado con hash nativo.", hash = nuevoHash });
    }
    else
    {
        var nuevoAdmin = new ReciboDeMercancia.Domain.Entities.Operador
        {
            Name = "admin",
            Password = nuevoHash,
            Rol = "operador"
        };
        context.Operadores.Add(nuevoAdmin);
        await context.SaveChangesAsync();
        return Results.Ok(new { mensaje = "Usuario 'admin' creado desde cero con hash nativo.", hash = nuevoHash });
    }
});

app.Run();
