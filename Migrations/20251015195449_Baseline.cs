using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PadelClub.Api.Migrations
{
    /// <inheritdoc />
    public partial class Baseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 🚫 Intencionalmente vacío.
            // Esta migración marca el estado actual de la BD como “baseline”
            // sin crear/alterar ninguna tabla/índice/columna.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 🚫 También vacío a propósito (no hay nada que revertir).
        }
    }
}
