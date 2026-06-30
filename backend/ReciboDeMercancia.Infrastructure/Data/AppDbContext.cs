using Microsoft.EntityFrameworkCore;
using ReciboDeMercancia.Domain.Entities;

namespace ReciboDeMercancia.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Operador> Operadores => Set<Operador>();
    public DbSet<Arribo> Arribos => Set<Arribo>();
    public DbSet<ArriboDetalle> ArriboDetalles => Set<ArriboDetalle>();
    public DbSet<Incidencia> Incidencias => Set<Incidencia>();
    public DbSet<Recepcion> Recepciones => Set<Recepcion>();
    public DbSet<RecepcionDetalle> RecepcionesDetalle => Set<RecepcionDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Producto: Sku = PK string
        modelBuilder.Entity<Producto>(e =>
        {
            e.ToTable("productos");
            e.HasKey(p => p.Sku);
            e.Property(p => p.Sku).HasColumnType("varchar(100)");
            e.Property(p => p.Name).HasColumnType("varchar(255)");
        });

        // Arribo
        modelBuilder.Entity<Arribo>(e =>
        {
            e.ToTable("arribos");
            e.HasKey(a => a.Id);
            e.HasIndex(a => a.Contenedor).IsUnique();
            e.Property(a => a.Contenedor).HasColumnType("varchar(100)");
            e.Property(a => a.Proveedor).HasColumnType("varchar(255)");
        });

        // ArriboDetalle
        modelBuilder.Entity<ArriboDetalle>(e =>
        {
            e.ToTable("arribos_detalle");
            e.HasKey(d => d.Id);
            e.Property(d => d.PO).HasColumnType("varchar(100)");
            e.Property(d => d.SkuProducto).HasColumnType("varchar(100)");

            e.HasOne(d => d.Arribo)
             .WithMany(a => a.Detalles)
             .HasForeignKey(d => d.ArriboId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(d => d.Producto)
             .WithMany()
             .HasForeignKey(d => d.SkuProducto)
             .HasPrincipalKey(p => p.Sku)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Incidencia
        modelBuilder.Entity<Incidencia>(e =>
        {
            e.ToTable("incidencias");
            e.HasKey(i => i.Id);
            e.Property(i => i.SkuProducto).HasColumnType("varchar(100)");
            e.Property(i => i.TipoIncidencia).HasColumnType("varchar(100)");

            // Sin FK a productos — SkuProducto es string libre (permite SKUs fuera de catálogo)
            e.Ignore(i => i.Producto);

            e.HasOne(i => i.ArriboDetalle)
             .WithMany()
             .HasForeignKey(i => i.ArriboDetalleId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Recepcion
        modelBuilder.Entity<Recepcion>(e =>
        {
            e.ToTable("recepciones");
            e.HasKey(r => r.Id);

            e.HasOne(r => r.Arribo)
             .WithMany()
             .HasForeignKey(r => r.ArriboId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(r => r.Operador)
             .WithMany()
             .HasForeignKey(r => r.OperadorId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(r => r.Incidencias)
             .WithOne(i => i.Recepcion)
             .HasForeignKey(i => i.RecepcionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // RecepcionDetalle
        modelBuilder.Entity<RecepcionDetalle>(e =>
        {
            e.ToTable("recepciones_detalle");
            e.HasKey(rd => rd.Id);
            e.Property(rd => rd.SkuProducto).HasColumnType("varchar(100)");

            e.HasOne(rd => rd.Recepcion)
             .WithMany(r => r.Detalles)
             .HasForeignKey(rd => rd.RecepcionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Operador
        modelBuilder.Entity<Operador>(e =>
        {
            e.ToTable("operadores");
        });
    }
}
