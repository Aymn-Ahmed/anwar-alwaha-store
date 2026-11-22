using System.Text;
using AnwarAlwaha.API.Data;
using AnwarAlwaha.API.Middlewares;
using AnwarAlwaha.API.Repositories.Implementations;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Implementations;
using AnwarAlwaha.API.Services.Interfaces;
using AnwarAlwaha.API.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Dynamic PORT resolution for Cloud PaaS (Render, Railway, Heroku)
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// 1. Database Connection (PostgreSQL via Npgsql)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// 2. Dependency Injection (3-Layer Architecture)
builder.Services.AddHttpClient();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IPosImportService, PosImportService>();
builder.Services.AddSingleton<IBarcodeImageFetcherService, BarcodeImageFetcherService>();
builder.Services.AddSingleton<IProductKeywordEnrichmentService, ProductKeywordEnrichmentService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IServiceCatalogService, ServiceCatalogService>();
builder.Services.AddScoped<IBundleService, BundleService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IMoyasarPaymentService, MoyasarPaymentService>();

// 3. FluentValidation Setup
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestDtoValidator>();

// 4. JWT Authentication Setup
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? "Default_Fallback_Secret_Key_At_Least_64_Characters_Long_For_Security_2026";
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
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
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. CORS Configuration
var corsOriginsConfig = builder.Configuration.GetSection("CorsOrigins").Get<string[]>() ?? Array.Empty<string>();
var corsOriginsEnv = Environment.GetEnvironmentVariable("CORS_ORIGINS")?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) ?? Array.Empty<string>();
var frontendUrlEnv = Environment.GetEnvironmentVariable("FRONTEND_URL")?.TrimEnd('/');

var allowedOrigins = corsOriginsConfig
    .Concat(corsOriginsEnv)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .ToHashSet(StringComparer.OrdinalIgnoreCase);

if (!string.IsNullOrWhiteSpace(frontendUrlEnv))
{
    allowedOrigins.Add(frontendUrlEnv);
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowStorefront", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrWhiteSpace(origin)) return false;
                  if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                  {
                      // Allow localhost / local loopback development
                      if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                          uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase))
                      {
                          return true;
                      }

                      // Allow standard Cloud & PaaS frontend platforms (Render, Vercel, Netlify, GitHub Pages)
                      if (uri.Host.EndsWith(".onrender.com", StringComparison.OrdinalIgnoreCase) ||
                          uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase) ||
                          uri.Host.EndsWith(".netlify.app", StringComparison.OrdinalIgnoreCase) ||
                          uri.Host.EndsWith("github.io", StringComparison.OrdinalIgnoreCase))
                      {
                          return true;
                      }
                  }
                  return allowedOrigins.Contains(origin);
              })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 6. Swagger Documentation with JWT Bearer Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "مكتبة أنوار الواحة API | Anwar Al Wahah Platform",
        Version = "v1",
        Description = "Production RESTful API for Anwar Al Wahah Store and Admin Dashboard."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "أدخل رمز JWT المصرح به هنا. مثال: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Security & Custom Middlewares
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();

if (app.Environment.IsDevelopment() || 
    builder.Configuration.GetValue<bool>("EnableSwagger", false) || 
    string.Equals(Environment.GetEnvironmentVariable("ENABLE_SWAGGER"), "true", StringComparison.OrdinalIgnoreCase))
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Anwar Al Wahah API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowStorefront");

app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint for cloud monitoring & Render zero-downtime health probes
app.MapGet("/healthz", () => Results.Ok(new 
{ 
    status = "healthy", 
    service = "AnwarAlwaha.API", 
    runtime = ".NET 9", 
    timestamp = DateTime.UtcNow 
}));

app.MapControllers();

// 8. Database connectivity & automated seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        if (context.Database.IsRelational())
        {
            try
            {
                logger.LogInformation("Verifying database migrations...");
                await context.Database.ExecuteSqlRawAsync(
                    "ALTER TABLE products ADD COLUMN IF NOT EXISTS \"Barcode\" character varying(64) NULL; " +
                    "CREATE INDEX IF NOT EXISTS \"IX_products_Barcode\" ON products (\"Barcode\"); " +
                    "ALTER TABLE products ADD COLUMN IF NOT EXISTS \"ImageFetchAttempted\" boolean NOT NULL DEFAULT false; " +
                    "ALTER TABLE products ADD COLUMN IF NOT EXISTS search_keywords TEXT NULL; " +
                    "ALTER TABLE categories ADD COLUMN IF NOT EXISTS \"ImageUrl\" text NULL;");
                await context.Database.MigrateAsync();
            }
            catch (Exception ex)
            {
                logger.LogInformation("Database schema notice: {Message}", ex.Message);
            }

            try
            {
                logger.LogInformation("Ensuring seed data is up to date...");
                await AnwarAlwaha.API.Data.Seed.DbInitializer.SeedAsync(context, logger);
            }
            catch (Exception ex)
            {
                logger.LogInformation("Database seed notice: {Message}", ex.Message);
            }

            logger.LogInformation("Database configured and ready.");
        }
    }
    catch (Exception ex)
    {
        logger.LogWarning("Startup database seeding notice: {Message}", ex.Message);
    }
}

app.Run();
