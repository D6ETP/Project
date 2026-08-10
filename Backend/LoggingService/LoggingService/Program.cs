using LoggingService.Services;
using Steeltoe.Discovery.Eureka;

var builder = WebApplication.CreateBuilder(args);

// Configure service port (8086)
builder.WebHost.UseUrls("http://localhost:8086");

// Add controllers
builder.Services.AddControllers();

// Register FileLoggerService as singleton
builder.Services.AddSingleton<FileLoggerService>();

// Register Eureka Discovery Client for Steeltoe
builder.Services.AddEurekaDiscoveryClient();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");
app.MapControllers();

Console.WriteLine("=============================================");
Console.WriteLine("📋 EasyTravel .NET Logging Service Running");
Console.WriteLine("🌐 Port: http://localhost:8086");
Console.WriteLine("📁 Log Files Directory: " + Path.Combine(app.Environment.ContentRootPath, "logs"));
Console.WriteLine("=============================================");

app.Run();
