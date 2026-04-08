using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Interview.Api.Data;

/// <summary>Design-time factory for <c>dotnet ef migrations</c>.</summary>
public sealed class AnalyticsDbContextFactory : IDesignTimeDbContextFactory<AnalyticsDbContext>
{
    public AnalyticsDbContext CreateDbContext(string[] args)
    {
        var dir = Path.Combine(Directory.GetCurrentDirectory(), "data");
        Directory.CreateDirectory(dir);
        var cs = $"Data Source={Path.Combine(dir, "analytics.db")}";
        var options = new DbContextOptionsBuilder<AnalyticsDbContext>()
            .UseSqlite(cs)
            .Options;
        return new AnalyticsDbContext(options);
    }
}
