using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordering.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderFulfillments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TableNumber",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Orders",
                newName: "SubmittedAt");

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OrderDate",
                table: "Orders",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Tables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    SeatsCount = table.Column<int>(type: "int", nullable: false),
                    Zone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsOccupied = table.Column<bool>(type: "bit", nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tables", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrderFulfillments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FulfillmentType = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false),
                    ProviderName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PickupCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DeclaredExternalTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TableId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Street = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    BuildingNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ApartmentNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    DriverEmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    TakeawayFulfillment_PhoneNumber = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    PickupTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderFulfillments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderFulfillments_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderFulfillments_Tables_TableId",
                        column: x => x.TableId,
                        principalTable: "Tables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Active_Filtered",
                table: "Orders",
                columns: new[] { "RestaurantId", "Status" },
                filter: "[Status] < 2");

            migrationBuilder.CreateIndex(
                name: "IX_OrderFulfillments_OrderId",
                table: "OrderFulfillments",
                column: "OrderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderFulfillments_TableId",
                table: "OrderFulfillments",
                column: "TableId");

            migrationBuilder.CreateIndex(
                name: "IX_Tables_RestaurantId_Number",
                table: "Tables",
                columns: new[] { "RestaurantId", "Number" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderFulfillments");

            migrationBuilder.DropTable(
                name: "Tables");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Active_Filtered",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "OrderDate",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "SubmittedAt",
                table: "Orders",
                newName: "UpdatedAt");

            migrationBuilder.AddColumn<string>(
                name: "TableNumber",
                table: "Orders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
