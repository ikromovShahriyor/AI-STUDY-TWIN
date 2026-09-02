using System.Text;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Infrastructure.AI;
using AiStudyTwin.Infrastructure.Audio;
using AiStudyTwin.Infrastructure.Persistence;
using AiStudyTwin.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace AiStudyTwin.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Database configuration: Postgres by default, SQLite fallback if Postgres is not reachable locally
        var postgresConn = configuration.GetConnectionString("DefaultConnection") 
                           ?? configuration["DATABASE_URL"] 
                           ?? "Host=localhost;Port=5432;Database=AiStudyTwinDb;Username=postgres;Password=postgres";

        var useSqlite = configuration.GetValue<bool>("UseSqlite", false);

        if (useSqlite)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(configuration.GetConnectionString("SqliteConnection") ?? "Data Source=aistudytwin.db"));
        }
        else
        {
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(postgresConn, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
                });
            });
        }

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // Identity & Security
        services.AddHttpContextAccessor();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // AI & Voice Services
        services.AddHttpClient<IWebSearchService, WebSearchService>()
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { UseProxy = false });

        services.AddHttpClient<IAiProviderService, AiProviderService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(35);
        })
        .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { UseProxy = false });

        services.AddHttpClient<ISpeechService, VoiceSpeechService>()
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { UseProxy = false });

        // JWT Authentication
        var secretKey = configuration["Jwt:Key"] ?? "AI_STUDY_TWIN_ULTRA_SECURE_JWT_SECRET_KEY_2026_SUPER_SAFE!";
        var issuer = configuration["Jwt:Issuer"] ?? "AiStudyTwin";
        var audience = configuration["Jwt:Audience"] ?? "AiStudyTwinApp";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        return services;
    }
}
