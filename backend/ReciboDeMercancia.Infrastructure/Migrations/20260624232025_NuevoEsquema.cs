using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciboDeMercancia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NuevoEsquema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "arribos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Contenedor = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Proveedor = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_arribos", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "operadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Password = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Rol = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_operadores", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "productos",
                columns: table => new
                {
                    Sku = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Upc = table.Column<long>(type: "bigint", nullable: false),
                    AltoProducto = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    AnchoProducto = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    LargoProducto = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Peso = table.Column<decimal>(type: "decimal(65,30)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_productos", x => x.Sku);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "arribos_detalle",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ArriboId = table.Column<int>(type: "int", nullable: false),
                    PO = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SkuProducto = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Cantidad = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_arribos_detalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_arribos_detalle_arribos_ArriboId",
                        column: x => x.ArriboId,
                        principalTable: "arribos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_arribos_detalle_productos_SkuProducto",
                        column: x => x.SkuProducto,
                        principalTable: "productos",
                        principalColumn: "Sku",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "incidencias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SkuProducto = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ArriboDetalleId = table.Column<int>(type: "int", nullable: false),
                    NumeroSerie = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TipoIncidencia = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Observacion = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EvidenciaFoto = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_incidencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_incidencias_arribos_detalle_ArriboDetalleId",
                        column: x => x.ArriboDetalleId,
                        principalTable: "arribos_detalle",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_incidencias_productos_SkuProducto",
                        column: x => x.SkuProducto,
                        principalTable: "productos",
                        principalColumn: "Sku",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "recepciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ArriboId = table.Column<int>(type: "int", nullable: false),
                    OperadorId = table.Column<int>(type: "int", nullable: false),
                    IncidenciaId = table.Column<int>(type: "int", nullable: true),
                    FechaYHoraLlegada = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaYHoraSalida = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recepciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recepciones_arribos_ArriboId",
                        column: x => x.ArriboId,
                        principalTable: "arribos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_recepciones_incidencias_IncidenciaId",
                        column: x => x.IncidenciaId,
                        principalTable: "incidencias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_recepciones_operadores_OperadorId",
                        column: x => x.OperadorId,
                        principalTable: "operadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_arribos_Contenedor",
                table: "arribos",
                column: "Contenedor",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_arribos_detalle_ArriboId",
                table: "arribos_detalle",
                column: "ArriboId");

            migrationBuilder.CreateIndex(
                name: "IX_arribos_detalle_SkuProducto",
                table: "arribos_detalle",
                column: "SkuProducto");

            migrationBuilder.CreateIndex(
                name: "IX_incidencias_ArriboDetalleId",
                table: "incidencias",
                column: "ArriboDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_incidencias_SkuProducto",
                table: "incidencias",
                column: "SkuProducto");

            migrationBuilder.CreateIndex(
                name: "IX_recepciones_ArriboId",
                table: "recepciones",
                column: "ArriboId");

            migrationBuilder.CreateIndex(
                name: "IX_recepciones_IncidenciaId",
                table: "recepciones",
                column: "IncidenciaId");

            migrationBuilder.CreateIndex(
                name: "IX_recepciones_OperadorId",
                table: "recepciones",
                column: "OperadorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recepciones");

            migrationBuilder.DropTable(
                name: "incidencias");

            migrationBuilder.DropTable(
                name: "operadores");

            migrationBuilder.DropTable(
                name: "arribos_detalle");

            migrationBuilder.DropTable(
                name: "arribos");

            migrationBuilder.DropTable(
                name: "productos");
        }
    }
}
