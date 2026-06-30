using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciboDeMercancia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjusteRecepcionIncidencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_recepciones_incidencias_IncidenciaId",
                table: "recepciones");

            migrationBuilder.DropIndex(
                name: "IX_recepciones_IncidenciaId",
                table: "recepciones");

            migrationBuilder.DropColumn(
                name: "IncidenciaId",
                table: "recepciones");

            migrationBuilder.AddColumn<int>(
                name: "RecepcionId",
                table: "incidencias",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_incidencias_RecepcionId",
                table: "incidencias",
                column: "RecepcionId");

            migrationBuilder.AddForeignKey(
                name: "FK_incidencias_recepciones_RecepcionId",
                table: "incidencias",
                column: "RecepcionId",
                principalTable: "recepciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_incidencias_recepciones_RecepcionId",
                table: "incidencias");

            migrationBuilder.DropIndex(
                name: "IX_incidencias_RecepcionId",
                table: "incidencias");

            migrationBuilder.DropColumn(
                name: "RecepcionId",
                table: "incidencias");

            migrationBuilder.AddColumn<int>(
                name: "IncidenciaId",
                table: "recepciones",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_recepciones_IncidenciaId",
                table: "recepciones",
                column: "IncidenciaId");

            migrationBuilder.AddForeignKey(
                name: "FK_recepciones_incidencias_IncidenciaId",
                table: "recepciones",
                column: "IncidenciaId",
                principalTable: "incidencias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
