using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Domain.Entities;

namespace ReciboDeMercancia.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Operador> Operadores => Set<Operador>();
    public DbSet<OrdenDeCompra> OrdenesDeCompra => Set<OrdenDeCompra>();
    public DbSet<OrdenDeCompraItem> OrdenesDeCompraItems => Set<OrdenDeCompraItem>();
    public DbSet<EntradaDeImportacion> EntradasDeImportacion => Set<EntradaDeImportacion>();
    public DbSet<EntradaDeImportacionDetalle> EntradasDeImportacionDetalles => Set<EntradaDeImportacionDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      
        modelBuilder.Entity<EntradaDeImportacionDetalle>()
            .HasOne(d => d.EntradaDeImportacion)
            .WithMany(e => e.Detalles)
            .HasForeignKey(d => d.EntradaDeImportacionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Detalle → Product (muchos a 1)
        modelBuilder.Entity<EntradaDeImportacionDetalle>()
            .HasOne(d => d.Product)
            .WithMany()
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // OrdenDeCompraItem → OrdenDeCompra
        modelBuilder.Entity<OrdenDeCompraItem>()
            .HasOne<OrdenDeCompra>()
            .WithMany()
            .HasForeignKey(o => o.EntradaDeImportacionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}