using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciboDeMercancia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarRecepcionDetalle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FechaYHoraSalida",
                table: "recepciones");

            migrationBuilder.CreateTable(
                name: "recepciones_detalle",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    SkuProducto = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CantidadRecibida = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recepciones_detalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recepciones_detalle_recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_recepciones_detalle_RecepcionId",
                table: "recepciones_detalle",
                column: "RecepcionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recepciones_detalle");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaYHoraSalida",
                table: "recepciones",
                type: "datetime(6)",
                nullable: true);
        }
    }
}
