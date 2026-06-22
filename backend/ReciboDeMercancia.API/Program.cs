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



app.MapPost("/importar_registro_erp", async () =>
{
    var erpConnStr = $"Driver={{SQL Server}};" +
                     $"Server={Environment.GetEnvironmentVariable("ERP_HOST")};" +
                     $"Database={Environment.GetEnvironmentVariable("ERP_NAME")};" +
                     $"UID={Environment.GetEnvironmentVariable("ERP_USER")};" +
                     $"PWD={Environment.GetEnvironmentVariable("ERP_PASSWORD")};" +
                     $"Timeout=10;";

    var localConnStr = $"Server={Environment.GetEnvironmentVariable("DB_HOST")};" +
                       $"Database=recibo_mercancia_db;" +
                       $"User ID={Environment.GetEnvironmentVariable("DB_USER")};" +
                       $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};" +
                       $"Port=3306;";

    var sqlExtract = """
        SELECT 
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
    try
    {
        using var erpConn = new OdbcConnection(erpConnStr);
        // 1. CAMBIO: Traemos todos los registros del ERP en una lista
        var registrosErp = (await erpConn.QueryAsync<dynamic>(sqlExtract)).ToList();

        if (!registrosErp.Any())
        {
            return Results.Json(new { error = "No se encontraron registros en el ERP." }, statusCode: 404);
        }

        using var localConn = new MySqlConnection(localConnStr);
        await localConn.OpenAsync();

        var columnasContenedores = (await localConn.QueryAsync<dynamic>("DESCRIBE contenedores;"))
                                    .Select(c => (string)c.Field.ToString().ToLower())
                                    .ToList();

        int totalImportados = 0;

        using var transaccion = await localConn.BeginTransactionAsync();
        try
        {
            // 2. CAMBIO: Iteramos sobre cada uno de los registros encontrados
            foreach (var registro in registrosErp)
            {
                // Validación de nulos para evitar el error de 'Situacion' u otros campos obligatorios
                string situacion = (string)registro.Situacion ?? "PENDIENTE"; 
                string proveedor = (string)registro.CFDIRetBeneficiarioNombre ?? "Proveedor Desconocido";
                string numeroContenedor = (string)registro.Referencia ?? "SIN_CONTENEDOR";

                DateTime fechaParseada = DateTime.Parse(registro.Fecha.ToString());
                string fechaFormateada = fechaParseada.ToString("yyyy-MM-dd");

                // Inserción dinámica de Contenedor
                var camposValidos = new List<string> { "numerocontenedor" };
                var valoresValidos = new List<string> { "@NumeroContenedor" };
                
                if (columnasContenedores.Contains("proveedor")) { camposValidos.Add("proveedor"); valoresValidos.Add("@Proveedor"); }
                if (columnasContenedores.Contains("ordencompra")) { camposValidos.Add("ordencompra"); valoresValidos.Add("@OrdenCompra"); }
                if (columnasContenedores.Contains("fecha")) { camposValidos.Add("fecha"); valoresValidos.Add("@Fecha"); }
                if (columnasContenedores.Contains("situacion")) { camposValidos.Add("situacion"); valoresValidos.Add("@Situacion"); }

                var sqlContenedor = $@"
                    INSERT IGNORE INTO contenedores ({string.Join(", ", camposValidos)}) 
                    VALUES ({string.Join(", ", valoresValidos)});";

                var paramContenedor = new
                {
                    NumeroContenedor = numeroContenedor,
                    Proveedor = proveedor,
                    OrdenCompra = (string)registro.origenid,
                    Situacion = situacion,
                    Fecha = fechaFormateada
                };

                await localConn.ExecuteAsync(sqlContenedor, paramContenedor, transaction: transaccion);
                // 1. Inserción en entradasdeimportacion (Cabecera)
                // Agregamos SELECT SCOPE_IDENTITY() para recuperar el ID generado automáticamente
                var sqlEntrada = """
                    INSERT INTO entradasdeimportacion (Situacion, Estatus, Proveedor, OrdenCompra, Usuario, Fecha, NumeroContenedor)
                    VALUES (@Situacion, @Estatus, @Proveedor, @OrdenCompra, @Usuario, @Fecha, @NumeroContenedor);
                    SELECT SCOPE_IDENTITY();
                """;

                // Agregamos el parámetro 'Estatus' que faltaba en tu objeto anónimo
                var paramEntrada = new
                {
                    Situacion = situacion,
                    Estatus = "AFECTADO", // O la variable que contenga el estatus dinámico
                    Proveedor = proveedor,
                    OrdenCompra = (string)registro.origenid,
                    Usuario = "SYSTEM", 
                    Fecha = fechaFormateada,
                    NumeroContenedor = numeroContenedor
                };

                // Ejecutamos la cabecera y obtenemos el ID generado
                var entradaId = await localConn.QuerySingleAsync<int>(sqlEntrada, paramEntrada, transaction: transaccion);

                // 2. Inserción en entradasdeimportaciondetalle (Detalle)
                var sqlDetalle = """
                    INSERT INTO entradasdeimportaciondetalle (Cantidad, EntradaDeImportacionId, ProductId)
                    VALUES (@Cantidad, @EntradaDeImportacionId, @ProductId);
                """;

                // Mapeamos los datos del artículo que vienen en tu objeto 'registro' del ERP
                // NOTA: Verifica que 'registro.Cantidad' y 'registro.Articulo' coincidan con las propiedades de tu objeto del ERP
                var paramDetalle = new
                {
                    Cantidad = (decimal)registro.Cantidad,
                    EntradaDeImportacionId = entradaId, // Usamos el ID obtenido en el paso anterior
                    ProductId = (int)registro.Articulo // Asegúrate de que el código del artículo sea entero o adáptalo
                };

                // Ejecutamos la inserción del detalle
                await localConn.ExecuteAsync(sqlDetalle, paramDetalle, transaction: transaccion);

                // Sumamos 1 al contador de registros principales importados con éxito
                totalImportados++;
            }

            await transaccion.CommitAsync();
            return Results.Ok(new { mensaje = $"Proceso completado. Se importaron {totalImportados} registros con éxito." });
        }
        catch
        {
            await transaccion.RollbackAsync();
            throw;
        }
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = "Fallo interno en el proceso masivo", detalle = ex.Message }, statusCode: 500);
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

app.Run();
