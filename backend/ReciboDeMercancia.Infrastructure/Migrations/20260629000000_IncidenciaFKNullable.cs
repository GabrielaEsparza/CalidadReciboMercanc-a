using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciboDeMercancia.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IncidenciaFKNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Eliminar FK de incidencias.SkuProducto -> productos.Sku
            migrationBuilder.DropForeignKey(
                name: "FK_incidencias_productos_SkuProducto",
                table: "incidencias");

            // Eliminar FK de incidencias.ArriboDetalleId -> arribos_detalle.Id
            migrationBuilder.DropForeignKey(
                name: "FK_incidencias_arribos_detalle_ArriboDetalleId",
                table: "incidencias");

            // Eliminar índice en SkuProducto (ya no hay FK)
            migrationBuilder.DropIndex(
                name: "IX_incidencias_SkuProducto",
                table: "incidencias");

            // Eliminar índice en ArriboDetalleId (se recreará como nullable)
            migrationBuilder.DropIndex(
                name: "IX_incidencias_ArriboDetalleId",
                table: "incidencias");

            // Hacer ArriboDetalleId nullable
            migrationBuilder.AlterColumn<int>(
                name: "ArriboDetalleId",
                table: "incidencias",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            // Recrear índice de ArriboDetalleId (nullable)
            migrationBuilder.CreateIndex(
                name: "IX_incidencias_ArriboDetalleId",
                table: "incidencias",
                column: "ArriboDetalleId");

            // Recrear FK de ArriboDetalleId como opcional
            migrationBuilder.AddForeignKey(
                name: "FK_incidencias_arribos_detalle_ArriboDetalleId",
                table: "incidencias",
                column: "ArriboDetalleId",
                principalTable: "arribos_detalle",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_incidencias_arribos_detalle_ArriboDetalleId",
                table: "incidencias");

            migrationBuilder.DropIndex(
                name: "IX_incidencias_ArriboDetalleId",
                table: "incidencias");

            migrationBuilder.AlterColumn<int>(
                name: "ArriboDetalleId",
                table: "incidencias",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_incidencias_ArriboDetalleId",
                table: "incidencias",
                column: "ArriboDetalleId");

            migrationBuilder.AddForeignKey(
                name: "FK_incidencias_arribos_detalle_ArriboDetalleId",
                table: "incidencias",
                column: "ArriboDetalleId",
                principalTable: "arribos_detalle",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.CreateIndex(
                name: "IX_incidencias_SkuProducto",
                table: "incidencias",
                column: "SkuProducto");

            migrationBuilder.AddForeignKey(
                name: "FK_incidencias_productos_SkuProducto",
                table: "incidencias",
                column: "SkuProducto",
                principalTable: "productos",
                principalColumn: "Sku",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
