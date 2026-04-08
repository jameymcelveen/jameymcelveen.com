using Microsoft.EntityFrameworkCore;

namespace Interview.Api.Data;

public sealed class AnalyticsDbContext(DbContextOptions<AnalyticsDbContext> options) : DbContext(options)
{
    public DbSet<VisitSession> VisitSessions => Set<VisitSession>();
    public DbSet<PageView> PageViews => Set<PageView>();
    public DbSet<AiChatTurn> AiChatTurns => Set<AiChatTurn>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VisitSession>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.VisitorKey);
            e.HasIndex(x => x.StartedAtUtc);
            e.Property(x => x.Referrer).HasMaxLength(2048);
            e.Property(x => x.ReferrerHost).HasMaxLength(512);
            e.Property(x => x.LandingPath).HasMaxLength(1024);
            e.Property(x => x.UserAgent).HasMaxLength(1024);
            e.Property(x => x.AcceptLanguage).HasMaxLength(128);
            e.Property(x => x.TimeZone).HasMaxLength(128);
            e.Property(x => x.IpAddress).HasMaxLength(64);
            e.Property(x => x.VisitorKey).HasMaxLength(64);
        });

        modelBuilder.Entity<PageView>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.VisitSessionId);
            e.HasIndex(x => x.EnteredAtUtc);
            e.Property(x => x.Path).HasMaxLength(2048);
            e.Property(x => x.Title).HasMaxLength(512);
            e.HasOne(x => x.VisitSession)
                .WithMany(s => s.PageViews)
                .HasForeignKey(x => x.VisitSessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AiChatTurn>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.VisitSessionId);
            e.HasIndex(x => x.CreatedAtUtc);
            e.Property(x => x.UserMessage).HasMaxLength(8000);
            e.Property(x => x.AssistantExcerpt).HasMaxLength(2000);
            e.Property(x => x.ModelName).HasMaxLength(256);
            e.Property(x => x.VisitorKey).HasMaxLength(64);
            e.Property(x => x.ErrorSummary).HasMaxLength(2000);
            e.Property(x => x.EstimatedCostUsd).HasPrecision(18, 8);
            e.HasOne(x => x.VisitSession)
                .WithMany(s => s.AiChatTurns)
                .HasForeignKey(x => x.VisitSessionId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
