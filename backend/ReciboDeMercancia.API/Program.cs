using Dapper;
using System.Data.Odbc;
using DotNetEnv;
using ReciboDeMercancia.Application.Services;
using ReciboDeMercancia.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;

DotNetEnv.Env.Load("./env");

var builder = WebApplication.CreateBuilder(args);

// 2. Servicios base del sistema
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

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
builder.Services.AddScoped<IImportacionService, ImportacionService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();

// 6. ¡CRÍTICO! Habilitar el middleware de CORS antes de mapear los controladores
app.UseCors("PermitirFrontend");

// 7. Mapear las rutas de los controladores convencionales (Activa /api/auth/login)
app.MapControllers();
app.MapPost("/alterar", () =>
{
    var connStr = $"Server={Environment.GetEnvironmentVariable("DB_HOST")};" +
                  $"Database=recibo_mercancia_db;" +
                  $"User ID={Environment.GetEnvironmentVariable("DB_USER")};" +
                  $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};" +
                  $"Port=3306;";

    using var conn = new MySqlConnection(connStr);
    var sql = """
        ALTER TABLE entradasdeimportacion 
        ADD Estatus VARCHAR(50) NOT NULL DEFAULT 'AFECTADO';
    """;


    var resultados = conn.Query(sql).ToList();
    return Results.Ok(resultados);
});
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
        SELECT TOP 1
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
        AND c.Estatus NOT IN ('SINAFECTAR')
    """;



    

    var resultados = conn.Query(sql).ToList();
    return Results.Ok(resultados);
});

// Endpoint GET /entradas (Tu motor rápido de Dapper para el ERP)
app.MapGet("/ver_tablas", async () =>
{
    var connStr =
        $"Driver={{SQL Server}};" +
        $"Server={Environment.GetEnvironmentVariable("ERP_HOST")};" +
        $"Database={Environment.GetEnvironmentVariable("ERP_NAME")};" +
        $"UID={Environment.GetEnvironmentVariable("ERP_USER")};" +
        $"PWD={Environment.GetEnvironmentVariable("ERP_PASSWORD")};" +
        $"Timeout=10;";

    try
    {
        using var conn = new OdbcConnection(connStr);
        // Trae todas las tablas creadas por el usuario en el ERP actual
        var sql = """
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME;
        """;

        var tablas = (await conn.QueryAsync<string>(sql)).ToList();
        return Results.Ok(tablas);
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = $"No se pudieron leer las tablas del ERP: {ex.Message}" }, statusCode: 500);
    }
});


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




app.MapPost("/poblar_catalogo_productos", async () =>
{
    var erpConnStr = $"Driver={{SQL Server}};" +
                     $"Server={Environment.GetEnvironmentVariable("ERP_HOST")};" +
                     $"Database={Environment.GetEnvironmentVariable("ERP_NAME")};" +
                     $"UID={Environment.GetEnvironmentVariable("ERP_USER")};" +
                     $"PWD={Environment.GetEnvironmentVariable("ERP_PASSWORD")};" +
                     $"Timeout=30;";

    var localConnStr = $"Server={Environment.GetEnvironmentVariable("DB_HOST")};" +
                       $"Database=recibo_mercancia_db;" +
                       $"User ID={Environment.GetEnvironmentVariable("DB_USER")};" +
                       $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};" +
                       $"Port=3306;";

    var sqlExtractAllProducts = """
        SELECT 
            a.Articulo AS Sku,
            COALESCE(a.ISBN, a.Articulo) AS UpcRaw,
            COALESCE(a.Descripcion1, 'Sin descripción') AS Name,
            a.AltoPieza AS Alto,
            a.AnchoPieza AS Ancho,
            a.LargoPieza AS Largo,
            COALESCE(a.PesoPieza, 0.0) AS Peso
        FROM Art a
        WHERE a.Rama = 'PRODUCTO' 
          AND a.Articulo IS NOT NULL;
    """;

    try
    {
        // 1. Extraemos todo de golpe desde tu ERP (Dapper)
        using var erpConn = new OdbcConnection(erpConnStr);
        var productosErp = (await erpConn.QueryAsync<dynamic>(sqlExtractAllProducts)).ToList();

        if (!productosErp.Any())
        {
            return Results.Json(new { error = "No se encontraron productos en el ERP." }, statusCode: 404);
        }

        // 2. Mapeamos la lista dinámica a los tipos de datos exactos de tu Entity 'Product'
        var listaMapeada = productosErp.Select(p => {
            long upcNumerico = 0;
            if (p.UpcRaw != null)
            {
                long.TryParse(p.UpcRaw.ToString(), out upcNumerico);
            }

            return new
            {
                Sku = (string)p.Sku,
                Upc = upcNumerico,
                Name = ((string)p.Name).Length > 255 ? ((string)p.Name).Substring(0, 255) : (string)p.Name,
                AltoProducto = p.Alto != null ? Convert.ToDecimal(p.Alto) : (decimal?)null,
                AnchoProducto = p.Ancho != null ? Convert.ToDecimal(p.Ancho) : (decimal?)null,
                LargoProducto = p.Largo != null ? Convert.ToDecimal(p.Largo) : (decimal?)null,
                Peso = p.Peso != null ? Convert.ToDecimal(p.Peso) : 0.0m
            };
        }).ToList();

        // 3. Conectamos a tu MySQL local e insertamos de forma masiva y súper rápida
        using var localConn = new MySqlConnection(localConnStr);
        await localConn.OpenAsync();


        var sqlInsert = """
            INSERT INTO productos (Sku, Upc, Name, AltoProducto, AnchoProducto, LargoProducto, Peso)
            VALUES (@Sku, @Upc, @Name, @AltoProducto, @AnchoProducto, @LargoProducto, @Peso)
            ON DUPLICATE KEY UPDATE
                Name = VALUES(Name),
                Upc = VALUES(Upc),
                AltoProducto = VALUES(AltoProducto),
                AnchoProducto = VALUES(AnchoProducto),
                LargoProducto = VALUES(LargoProducto),
                Peso = VALUES(Peso);
        """;

        int filasAfectadas = await localConn.ExecuteAsync(sqlInsert, listaMapeada);

        return Results.Ok(new 
        { 
            mensaje = "Catálogo local de productos poblado exitosamente.", 
            totalLeidosDelErp = listaMapeada.Count,
            nuevosProductosInsertados = filasAfectadas 
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = $"Error fatal al procesar el dropper: {ex.Message}" }, statusCode: 500);
    }
});


// OBSOLETO: importar_registro_erp eliminado. Arriobos se nutren del Excel.



// Endpoint temporal: verificar columnas e IDs de tabla art del ERP
app.MapGet("/debug_art", async () =>
{
    var connStr =
        $"Driver={{SQL Server}};" +
        $"Server={Environment.GetEnvironmentVariable("ERP_HOST")};" +
        $"Database={Environment.GetEnvironmentVariable("ERP_NAME")};" +
        $"UID={Environment.GetEnvironmentVariable("ERP_USER")};" +
        $"PWD={Environment.GetEnvironmentVariable("ERP_PASSWORD")};" +
        $"Timeout=10;";
    try
    {
        using var conn = new OdbcConnection(connStr);

        // Columnas de la tabla art
        var columnas = (await conn.QueryAsync<string>(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'art' ORDER BY ORDINAL_POSITION;"
        )).ToList();

        // Muestra de 5 registros con todos sus campos de identidad
        var muestra = (await conn.QueryAsync<dynamic>(
            "SELECT TOP 5 * FROM art WHERE Rama = 'PRODUCTO';"
        )).ToList();

        return Results.Ok(new { columnas, muestra });
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = ex.Message }, statusCode: 500);
    }
});

app.Run();
