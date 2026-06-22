using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MySql.Data.MySqlClient; 
using Dapper; 

namespace ReciboDeMercancia.Application.Services;

public class ImportacionService : IImportacionService
{
    public async Task<IEnumerable<dynamic>> ObtenerTablasLocalAsync()
    {
        var connStr = 
            $"Server={Environment.GetEnvironmentVariable("DB_HOST")};" +
            $"Database=recibo_mercancia_db;" + 
            $"User ID={Environment.GetEnvironmentVariable("DB_USER")};" +
            $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};" +
            $"Port=3306;";

        using var conn = new MySqlConnection(connStr);
        
        var tablas = await conn.QueryAsync("SELECT * FROM entradasdeimportacion WHERE OrdenCompra = 'GDL3789';");
        
        return tablas;
    }
}