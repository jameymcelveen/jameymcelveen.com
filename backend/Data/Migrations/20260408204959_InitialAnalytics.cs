using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Interview.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialAnalytics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VisitSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    VisitorKey = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    EndedAtUtc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    Referrer = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                    ReferrerHost = table.Column<string>(type: "TEXT", maxLength: 512, nullable: true),
                    LandingPath = table.Column<string>(type: "TEXT", maxLength: 1024, nullable: false),
                    UserAgent = table.Column<string>(type: "TEXT", maxLength: 1024, nullable: true),
                    AcceptLanguage = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    ScreenWidth = table.Column<int>(type: "INTEGER", nullable: true),
                    ScreenHeight = table.Column<int>(type: "INTEGER", nullable: true),
                    ViewportWidth = table.Column<int>(type: "INTEGER", nullable: true),
                    ViewportHeight = table.Column<int>(type: "INTEGER", nullable: true),
                    TimeZone = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    IpAddress = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AiChatTurns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    VisitSessionId = table.Column<Guid>(type: "TEXT", nullable: true),
                    VisitorKey = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    UserMessage = table.Column<string>(type: "TEXT", maxLength: 8000, nullable: false),
                    AssistantExcerpt = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    ModelName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    PromptTokens = table.Column<int>(type: "INTEGER", nullable: true),
                    OutputTokens = table.Column<int>(type: "INTEGER", nullable: true),
                    EstimatedCostUsd = table.Column<decimal>(type: "TEXT", precision: 18, scale: 8, nullable: false),
                    HttpStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    ErrorSummary = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiChatTurns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiChatTurns_VisitSessions_VisitSessionId",
                        column: x => x.VisitSessionId,
                        principalTable: "VisitSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PageViews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    VisitSessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Path = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 512, nullable: true),
                    EnteredAtUtc = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    LeftAtUtc = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    DurationSeconds = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PageViews_VisitSessions_VisitSessionId",
                        column: x => x.VisitSessionId,
                        principalTable: "VisitSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiChatTurns_CreatedAtUtc",
                table: "AiChatTurns",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_AiChatTurns_VisitSessionId",
                table: "AiChatTurns",
                column: "VisitSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PageViews_EnteredAtUtc",
                table: "PageViews",
                column: "EnteredAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_PageViews_VisitSessionId",
                table: "PageViews",
                column: "VisitSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_VisitSessions_StartedAtUtc",
                table: "VisitSessions",
                column: "StartedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_VisitSessions_VisitorKey",
                table: "VisitSessions",
                column: "VisitorKey");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiChatTurns");

            migrationBuilder.DropTable(
                name: "PageViews");

            migrationBuilder.DropTable(
                name: "VisitSessions");
        }
    }
}
