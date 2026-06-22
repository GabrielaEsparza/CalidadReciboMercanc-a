using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciboDeMercancia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Contenedores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    NumeroContenedor = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FechaLlegada = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contenedores", x => x.Id);
                    table.UniqueConstraint("AK_Contenedores_NumeroContenedor", x => x.NumeroContenedor);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Operadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Operadores", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Sku = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Upc = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AltoProducto = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    AnchoProducto = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    LargoProducto = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Peso = table.Column<decimal>(type: "decimal(65,30)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EntradasDeImportacion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Situacion = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Proveedor = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OrdenCompra = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Usuario = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Fecha = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    NumeroContenedor = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntradasDeImportacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntradasDeImportacion_Contenedores_NumeroContenedor",
                        column: x => x.NumeroContenedor,
                        principalTable: "Contenedores",
                        principalColumn: "NumeroContenedor",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "OrdenesDeCompra",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    NumeroDeOrden = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NombreProveedor = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContenedorId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdenesDeCompra", x => x.Id);
                    table.UniqueConstraint("AK_OrdenesDeCompra_NumeroDeOrden", x => x.NumeroDeOrden);
                    table.ForeignKey(
                        name: "FK_OrdenesDeCompra_Contenedores_ContenedorId",
                        column: x => x.ContenedorId,
                        principalTable: "Contenedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Recepciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FechaInicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    ContenedorId = table.Column<int>(type: "int", nullable: false),
                    OperadorQCId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recepciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recepciones_Contenedores_ContenedorId",
                        column: x => x.ContenedorId,
                        principalTable: "Contenedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recepciones_Operadores_OperadorQCId",
                        column: x => x.OperadorQCId,
                        principalTable: "Operadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EntradasDeImportacionDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Cantidad = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    EntradaDeImportacionId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntradasDeImportacionDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntradasDeImportacionDetalles_EntradasDeImportacion_EntradaD~",
                        column: x => x.EntradaDeImportacionId,
                        principalTable: "EntradasDeImportacion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EntradasDeImportacionDetalles_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "OrdenesDeCompraDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Cantidad = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    NumeroDeOrden = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ProductId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdenesDeCompraDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrdenesDeCompraDetalles_OrdenesDeCompra_NumeroDeOrden",
                        column: x => x.NumeroDeOrden,
                        principalTable: "OrdenesDeCompra",
                        principalColumn: "NumeroDeOrden",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdenesDeCompraDetalles_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Incidencias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    CantidadAfectada = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Descripcion = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Incidencias_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Incidencias_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RecepcionDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CantidadEsperada = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    CantidadRecibida = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    PrimeraCajaValidada = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecepcionDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecepcionDetalles_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecepcionDetalles_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RecepcionOperadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    OperadorId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecepcionOperadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecepcionOperadores_Operadores_OperadorId",
                        column: x => x.OperadorId,
                        principalTable: "Operadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecepcionOperadores_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ValidacionesCaja",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PesoReal = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    PesoEsperado = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    AltoReal = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    AnchoReal = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    LargoReal = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Aprobada = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Observaciones = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecepcionDetalleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValidacionesCaja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ValidacionesCaja_RecepcionDetalles_RecepcionDetalleId",
                        column: x => x.RecepcionDetalleId,
                        principalTable: "RecepcionDetalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_EntradasDeImportacion_NumeroContenedor",
                table: "EntradasDeImportacion",
                column: "NumeroContenedor");

            migrationBuilder.CreateIndex(
                name: "IX_EntradasDeImportacionDetalles_EntradaDeImportacionId",
                table: "EntradasDeImportacionDetalles",
                column: "EntradaDeImportacionId");

            migrationBuilder.CreateIndex(
                name: "IX_EntradasDeImportacionDetalles_ProductId",
                table: "EntradasDeImportacionDetalles",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_ProductId",
                table: "Incidencias",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_RecepcionId",
                table: "Incidencias",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeCompra_ContenedorId",
                table: "OrdenesDeCompra",
                column: "ContenedorId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeCompraDetalles_NumeroDeOrden",
                table: "OrdenesDeCompraDetalles",
                column: "NumeroDeOrden");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeCompraDetalles_ProductId",
                table: "OrdenesDeCompraDetalles",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionDetalles_ProductId",
                table: "RecepcionDetalles",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionDetalles_RecepcionId",
                table: "RecepcionDetalles",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_Recepciones_ContenedorId",
                table: "Recepciones",
                column: "ContenedorId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recepciones_OperadorQCId",
                table: "Recepciones",
                column: "OperadorQCId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionOperadores_OperadorId",
                table: "RecepcionOperadores",
                column: "OperadorId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionOperadores_RecepcionId",
                table: "RecepcionOperadores",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_ValidacionesCaja_RecepcionDetalleId",
                table: "ValidacionesCaja",
                column: "RecepcionDetalleId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EntradasDeImportacionDetalles");

            migrationBuilder.DropTable(
                name: "Incidencias");

            migrationBuilder.DropTable(
                name: "OrdenesDeCompraDetalles");

            migrationBuilder.DropTable(
                name: "RecepcionOperadores");

            migrationBuilder.DropTable(
                name: "ValidacionesCaja");

            migrationBuilder.DropTable(
                name: "EntradasDeImportacion");

            migrationBuilder.DropTable(
                name: "OrdenesDeCompra");

            migrationBuilder.DropTable(
                name: "RecepcionDetalles");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Recepciones");

            migrationBuilder.DropTable(
                name: "Contenedores");

            migrationBuilder.DropTable(
                name: "Operadores");
        }
    }
}
