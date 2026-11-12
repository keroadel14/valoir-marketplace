using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using System.Text;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using Valoir.Application.Admin.Commands;
using Valoir.Application.Common.Interfaces;
using Valoir.Infrastructure.Identity;
using Valoir.Infrastructure.Persistence;
using Valoir.Infrastructure.Services;
using Valoir.WebApi.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ValoirDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Host=localhost;Database=valoir;Username=valoir;Password=valoir"));
builder.Services.AddScoped<IValoirDbContext>(sp => sp.GetRequiredService<ValoirDbContext>());

builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequiredLength = 12;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.User.RequireUniqueEmail = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
})
.AddEntityFrameworkStores<ValoirDbContext>()
.AddDefaultTokenProviders();

var jwtKey = builder.Configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("VALOIR_JWT_KEY")
    ?? "DEV_ONLY_CHANGE_ME_TO_A_LONG_RANDOM_SECRET_KEY_32CHARS_MIN";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "valoir.luxury",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "valoir.luxury",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromMinutes(1)
    };
    // Allow SignalR to receive access token via query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                context.Token = accessToken;
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdminOnly", p => p.RequireRole(SuperAdminSeeder.SuperAdminRole));
    options.AddPolicy("AdminOrAbove", p => p.RequireRole(SuperAdminSeeder.SuperAdminRole, SuperAdminSeeder.AdminRole));
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAdminAuditService, AdminAuditService>();
builder.Services.AddScoped<IStripeConnectService, StripeConnectService>();
builder.Services.AddScoped<IInventoryReservationService, RedisInventoryReservationService>();
builder.Services.AddSingleton<ITokenService, JwtTokenService>();
builder.Services.AddHostedService<OutboxProcessor>();
builder.Services.AddSingleton<IRealtimeNotifier, Valoir.WebApi.Services.SignalRRealtimeNotifier>();

var redisCs = builder.Configuration.GetConnectionString("Redis") ?? Environment.GetEnvironmentVariable("VALOIR_REDIS");
if (!string.IsNullOrWhiteSpace(redisCs))
    builder.Services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisCs));

// MediatR: Application (commands/queries) + Infrastructure (auth handlers)
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(ApproveBoutiqueCommand).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(AuthHandlersMarker).Assembly); // Infrastructure: Auth + other handlers
});
builder.Services.AddValidatorsFromAssembly(typeof(ApproveBoutiqueCommandValidator).Assembly);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 20;
        opt.QueueLimit = 0;
    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true)));

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ValoirDbContext>();
    await db.Database.MigrateAsync();
}
await SuperAdminSeeder.SeedAsync(app.Services);
await DemoDataSeeder.SeedAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<MarketplaceHub>("/hubs/marketplace");

app.Run();

public partial class Program { }
