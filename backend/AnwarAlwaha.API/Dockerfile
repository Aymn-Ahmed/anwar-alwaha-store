# =============================================================================
# Anwar Al Wahah Store - Backend ASP.NET Core 9 Web API Dockerfile
# Multi-stage production build for maximum security and small image footprint
# =============================================================================

# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies (layer caching)
COPY ["AnwarAlwaha.API.csproj", "./"]
RUN dotnet restore "AnwarAlwaha.API.csproj"

# Copy remaining source code and publish
COPY . .
RUN dotnet publish "AnwarAlwaha.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Non-root user for security
USER $APP_UID

COPY --from=build /app/publish .

# Standard environment settings
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose standard application ports (Render / Cloud / Docker)
EXPOSE 5000
EXPOSE 8080
EXPOSE 10000

ENTRYPOINT ["dotnet", "AnwarAlwaha.API.dll"]
