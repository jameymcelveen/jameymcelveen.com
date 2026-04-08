# .NET 9 Minimal API for Railway or generic container hosts.
# Build from repo root: docker build -f backend/Dockerfile backend
# Railway: set root directory to `backend` or adjust paths accordingly.

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Interview.Api.csproj .
RUN dotnet restore Interview.Api.csproj
COPY . .
RUN dotnet publish Interview.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
# Railway injects PORT; fall back to 8080 for local/smoke tests.
CMD ["sh", "-c", "exec dotnet Interview.Api.dll --urls http://0.0.0.0:${PORT:-8080}"]
