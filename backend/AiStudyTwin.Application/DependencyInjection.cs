using AiStudyTwin.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace AiStudyTwin.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<AuthService>();
        services.AddScoped<ProfileService>();
        services.AddScoped<StudyPlanService>();
        services.AddScoped<TestService>();
        services.AddScoped<ChatService>();
        services.AddScoped<ProgressService>();
        services.AddScoped<GamificationService>();
        services.AddScoped<AiStudyTwinEngineService>();
        services.AddScoped<VoiceService>();

        return services;
    }
}
