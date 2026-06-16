using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Domain.Entities;

namespace ReciboDeMercancia.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Operador> Operadores => Set<Operador>();
    public DbSet<Contenedor> Contenedores => Set<Contenedor>();
    public DbSet<OrdenDeCompra> OrdenesDeCompra => Set<OrdenDeCompra>();
    public DbSet<OrdenDeCompraDetalle> OrdenesDeCompraDetalles => Set<OrdenDeCompraDetalle>();
    public DbSet<EntradaDeImportacion> EntradasDeImportacion => Set<EntradaDeImportacion>();
    public DbSet<EntradaDeImportacionDetalle> EntradasDeImportacionDetalles => Set<EntradaDeImportacionDetalle>();
    public DbSet<Recepcion> Recepciones => Set<Recepcion>();
    public DbSet<RecepcionDetalle> RecepcionDetalles => Set<RecepcionDetalle>();
    public DbSet<RecepcionOperador> RecepcionOperadores => Set<RecepcionOperador>();
    public DbSet<ValidacionCaja> ValidacionesCaja => Set<ValidacionCaja>();
    public DbSet<Incidencia> Incidencias => Set<Incidencia>();

   protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // PK de Contenedor es NumeroContenedor
    modelBuilder.Entity<Contenedor>()
        .HasKey(c => c.NumeroContenedor);

    // PK de OrdenDeCompra es NumeroDeOrden
    modelBuilder.Entity<OrdenDeCompra>()
        .HasKey(o => o.NumeroDeOrden);

    // EntradaDeImportacion → Contenedor
    modelBuilder.Entity<EntradaDeImportacion>()
        .HasOne(e => e.Contenedor)
        .WithMany()
        .HasForeignKey(e => e.NumeroContenedor)
        .OnDelete(DeleteBehavior.Restrict);

    // EntradaDeImportacionDetalle → EntradaDeImportacion
    modelBuilder.Entity<EntradaDeImportacionDetalle>()
        .HasOne(d => d.EntradaDeImportacion)
        .WithMany(e => e.Detalles)
        .HasForeignKey(d => d.EntradaDeImportacionId)
        .OnDelete(DeleteBehavior.Cascade);

    // EntradaDeImportacionDetalle → Product
    modelBuilder.Entity<EntradaDeImportacionDetalle>()
        .HasOne(d => d.Product)
        .WithMany()
        .HasForeignKey(d => d.ProductId)
        .OnDelete(DeleteBehavior.Restrict);

    // OrdenDeCompra → Contenedor
    modelBuilder.Entity<OrdenDeCompra>()
        .HasOne(o => o.Contenedor)
        .WithMany(c => c.OrdenesDeCompra)
        .HasForeignKey(o => o.NumeroContenedor)
        .OnDelete(DeleteBehavior.Restrict);

    // OrdenDeCompraDetalle → OrdenDeCompra
    modelBuilder.Entity<OrdenDeCompraDetalle>()
        .HasOne(d => d.OrdenDeCompra)
        .WithMany(o => o.Detalles)
        .HasForeignKey(d => d.NumeroDeOrden)
        .OnDelete(DeleteBehavior.Cascade);

    // OrdenDeCompraDetalle → Product
    modelBuilder.Entity<OrdenDeCompraDetalle>()
        .HasOne(d => d.Product)
        .WithMany()
        .HasForeignKey(d => d.ProductId)
        .OnDelete(DeleteBehavior.Restrict);

    // Recepcion → Contenedor
    modelBuilder.Entity<Recepcion>()
        .HasOne(r => r.Contenedor)
        .WithOne(c => c.Recepcion)
        .HasForeignKey<Recepcion>(r => r.NumeroContenedor)
        .OnDelete(DeleteBehavior.Restrict);

    // Recepcion → OperadorQC
    modelBuilder.Entity<Recepcion>()
        .HasOne(r => r.OperadorQC)
        .WithMany()
        .HasForeignKey(r => r.OperadorQCId)
        .OnDelete(DeleteBehavior.Restrict);

    // RecepcionOperador → Recepcion
    modelBuilder.Entity<RecepcionOperador>()
        .HasOne(ro => ro.Recepcion)
        .WithMany(r => r.Operadores)
        .HasForeignKey(ro => ro.RecepcionId)
        .OnDelete(DeleteBehavior.Cascade);

    // RecepcionOperador → Operador
    modelBuilder.Entity<RecepcionOperador>()
        .HasOne(ro => ro.Operador)
        .WithMany()
        .HasForeignKey(ro => ro.OperadorId)
        .OnDelete(DeleteBehavior.Restrict);

    // RecepcionDetalle → Recepcion
    modelBuilder.Entity<RecepcionDetalle>()
        .HasOne(d => d.Recepcion)
        .WithMany(r => r.Detalles)
        .HasForeignKey(d => d.RecepcionId)
        .OnDelete(DeleteBehavior.Cascade);

    // RecepcionDetalle → Product
    modelBuilder.Entity<RecepcionDetalle>()
        .HasOne(d => d.Product)
        .WithMany()
        .HasForeignKey(d => d.ProductId)
        .OnDelete(DeleteBehavior.Restrict);

    // ValidacionCaja → RecepcionDetalle
    modelBuilder.Entity<ValidacionCaja>()
        .HasOne(v => v.RecepcionDetalle)
        .WithOne(d => d.ValidacionCaja)
        .HasForeignKey<ValidacionCaja>(v => v.RecepcionDetalleId)
        .OnDelete(DeleteBehavior.Cascade);

    // Incidencia → Recepcion
    modelBuilder.Entity<Incidencia>()
        .HasOne(i => i.Recepcion)
        .WithMany(r => r.Incidencias)
        .HasForeignKey(i => i.RecepcionId)
        .OnDelete(DeleteBehavior.Cascade);

    // Incidencia → Product
    modelBuilder.Entity<Incidencia>()
        .HasOne(i => i.Product)
        .WithMany()
        .HasForeignKey(i => i.ProductId)
        .OnDelete(DeleteBehavior.Restrict);
}
}