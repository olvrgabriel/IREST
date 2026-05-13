using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IREST.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPerguntaSeguranca : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PerguntaSeguranca",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RespostaSeguranca",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PerguntaSeguranca",
                table: "Funerarias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RespostaSeguranca",
                table: "Funerarias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PerguntaSeguranca",
                table: "Admins",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RespostaSeguranca",
                table: "Admins",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "PerguntaSeguranca", table: "Usuarios");
            migrationBuilder.DropColumn(name: "RespostaSeguranca", table: "Usuarios");
            migrationBuilder.DropColumn(name: "PerguntaSeguranca", table: "Funerarias");
            migrationBuilder.DropColumn(name: "RespostaSeguranca", table: "Funerarias");
            migrationBuilder.DropColumn(name: "PerguntaSeguranca", table: "Admins");
            migrationBuilder.DropColumn(name: "RespostaSeguranca", table: "Admins");
        }
    }
}
