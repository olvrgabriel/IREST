using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IREST.API.Migrations
{
    /// <inheritdoc />
    public partial class ServicoFunerariaNN : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Cria a tabela associativa (N:N)
            migrationBuilder.CreateTable(
                name: "FunerariaServicos",
                columns: table => new
                {
                    FunerariaId = table.Column<int>(type: "int", nullable: false),
                    ServicoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FunerariaServicos", x => new { x.FunerariaId, x.ServicoId });
                    table.ForeignKey(
                        name: "FK_FunerariaServicos_Funerarias_FunerariaId",
                        column: x => x.FunerariaId,
                        principalTable: "Funerarias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FunerariaServicos_Servicos_ServicoId",
                        column: x => x.ServicoId,
                        principalTable: "Servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FunerariaServicos_ServicoId",
                table: "FunerariaServicos",
                column: "ServicoId");

            // 2) MIGRA OS DADOS: cada servico existente vira um vinculo com sua funeraria
            migrationBuilder.Sql(
                "INSERT INTO FunerariaServicos (FunerariaId, ServicoId) " +
                "SELECT FunerariaId, Id FROM Servicos WHERE FunerariaId IS NOT NULL AND FunerariaId > 0;");

            // 3) So depois remove a FK/indice/coluna antiga de Servicos
            migrationBuilder.DropForeignKey(
                name: "FK_Servicos_Funerarias_FunerariaId",
                table: "Servicos");

            migrationBuilder.DropIndex(
                name: "IX_Servicos_FunerariaId",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "FunerariaId",
                table: "Servicos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1) Recria a coluna
            migrationBuilder.AddColumn<int>(
                name: "FunerariaId",
                table: "Servicos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // 2) Restaura o vinculo (pega a primeira funeraria de cada servico)
            migrationBuilder.Sql(
                "UPDATE Servicos SET FunerariaId = ISNULL(" +
                "(SELECT TOP 1 FunerariaId FROM FunerariaServicos WHERE ServicoId = Servicos.Id), 0);");

            migrationBuilder.CreateIndex(
                name: "IX_Servicos_FunerariaId",
                table: "Servicos",
                column: "FunerariaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Servicos_Funerarias_FunerariaId",
                table: "Servicos",
                column: "FunerariaId",
                principalTable: "Funerarias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropTable(
                name: "FunerariaServicos");
        }
    }
}
