using AiStudyTwin.Api.Middlewares;
using AiStudyTwin.Application;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Infrastructure;
using AiStudyTwin.Infrastructure.Persistence;

// Load .env file if present
bool envFileLoaded = LoadDotEnv();

var builder = WebApplication.CreateBuilder(args);
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}
builder.Configuration.AddEnvironmentVariables();

static bool LoadDotEnv()
{
    try
    {
        var current = Directory.GetCurrentDirectory();
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var searchDirs = new List<string>
        {
            current,
            Path.Combine(current, ".."),
            Path.Combine(current, "..", ".."),
            baseDir,
            Path.Combine(baseDir, "..", "..", "..", ".."),
            Path.Combine(baseDir, "..", "..", "..", "..", "..")
        };

        foreach (var dir in searchDirs.Distinct())
        {
            if (!Directory.Exists(dir)) continue;
            var envPath = Path.Combine(dir, ".env");
            if (File.Exists(envPath))
            {
                foreach (var line in File.ReadAllLines(envPath))
                {
                    var trimmed = line.Trim();
                    if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#")) continue;
                    var idx = trimmed.IndexOf('=');
                    if (idx <= 0) continue;
                    var key = trimmed[..idx].Trim();
                    var val = trimmed[(idx + 1)..].Trim().Trim('"', '\'');
                    if (!string.IsNullOrEmpty(key) && string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                    {
                        Environment.SetEnvironmentVariable(key, val);
                    }
                }
                return true;
            }
        }
    }
    catch
    {
        // Ignore .env load failures if environment variables are already injected
    }
    return false;
}

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Clean Architecture Layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// CORS - Allow all origins for dev/production flex
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Database migration & seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        var hasher = services.GetRequiredService<IPasswordHasher>();
        
        logger.LogInformation("Ensuring database is created and initialized...");
        await db.Database.EnsureCreatedAsync();
        await DbInitializer.SeedAsync(db, hasher);
        logger.LogInformation("Database initialization and seeding completed successfully.");
        logger.LogInformation("Environment .env file status: {Status}", envFileLoaded ? "LOADED" : "NOT FOUND / SYSTEM ENV");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

// Middlewares
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AI STUDY TWIN API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    name = "AI STUDY TWIN API",
    status = "Online",
    version = "1.0.0",
    swagger = "/swagger",
    timestamp = DateTime.UtcNow
}));

app.MapGet("/health", (IConfiguration config) =>
{
    var geminiKey = config["GEMINI_API_KEY"] ?? config["Ai:GeminiApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    var hasGemini = !string.IsNullOrWhiteSpace(geminiKey) && !geminiKey.Contains("USER_WILL_ADD_REAL_KEY_HERE");

    return Results.Ok(new
    {
        status = "Healthy",
        geminiApiKey = hasGemini ? "CONFIGURED" : "NOT CONFIGURED",
        backendEnvLoaded = envFileLoaded ? "YES" : "NO",
        activeProvider = "Google Gemini",
        activeModel = config["Ai:GeminiModel"] ?? "gemini-2.0-flash",
        realAiWorking = hasGemini ? "YES" : "NO (Waiting for GEMINI_API_KEY in .env)",
        timestamp = DateTime.UtcNow
    });
});

app.Run();
