FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files
COPY ["backend/AiStudyTwin.slnx", "backend/"]
COPY ["backend/AiStudyTwin.Domain/AiStudyTwin.Domain.csproj", "backend/AiStudyTwin.Domain/"]
COPY ["backend/AiStudyTwin.Application/AiStudyTwin.Application.csproj", "backend/AiStudyTwin.Application/"]
COPY ["backend/AiStudyTwin.Infrastructure/AiStudyTwin.Infrastructure.csproj", "backend/AiStudyTwin.Infrastructure/"]
COPY ["backend/AiStudyTwin.Api/AiStudyTwin.Api.csproj", "backend/AiStudyTwin.Api/"]

# Restore
RUN dotnet restore "backend/AiStudyTwin.Api/AiStudyTwin.Api.csproj"

# Copy full backend source and build
COPY backend/ backend/
WORKDIR "/src/backend/AiStudyTwin.Api"
RUN dotnet publish "AiStudyTwin.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5050
ENV ASPNETCORE_URLS=http://+:5050
ENV UseSqlite=true
ENTRYPOINT ["dotnet", "AiStudyTwin.Api.dll"]
