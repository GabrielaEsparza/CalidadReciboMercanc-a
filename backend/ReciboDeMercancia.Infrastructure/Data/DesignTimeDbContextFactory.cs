using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ReciboDeMercancia.Infrastructure.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        
         // Pon aquí tu contraseña real y el puerto si es diferente al 3306
        var connectionString = "Server=localhost;Port=3306;Database=recibo_mercancia_db;Uid=root;Pwd=Passw0rd1;";

        optionsBuilder.UseMySql(
            connectionString, 
            ServerVersion.AutoDetect(connectionString)
        );

        return new AppDbContext(optionsBuilder.Options);
    }
}
