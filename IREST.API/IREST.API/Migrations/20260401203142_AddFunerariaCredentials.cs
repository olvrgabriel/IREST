using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IREST.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFunerariaCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Funerarias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Senha",
                table: "Funerarias",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "Funerarias");

            migrationBuilder.DropColumn(
                name: "Senha",
                table: "Funerarias");
        }
    }
}
