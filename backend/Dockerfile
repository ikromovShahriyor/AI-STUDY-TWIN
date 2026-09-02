FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files
COPY ["AiStudyTwin.slnx", "./"]
COPY ["AiStudyTwin.Domain/AiStudyTwin.Domain.csproj", "AiStudyTwin.Domain/"]
COPY ["AiStudyTwin.Application/AiStudyTwin.Application.csproj", "AiStudyTwin.Application/"]
COPY ["AiStudyTwin.Infrastructure/AiStudyTwin.Infrastructure.csproj", "AiStudyTwin.Infrastructure/"]
COPY ["AiStudyTwin.Api/AiStudyTwin.Api.csproj", "AiStudyTwin.Api/"]

# Restore
RUN dotnet restore "AiStudyTwin.Api/AiStudyTwin.Api.csproj"

# Copy full source and build
COPY . .
WORKDIR "/src/AiStudyTwin.Api"
RUN dotnet publish "AiStudyTwin.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "AiStudyTwin.Api.dll"]
