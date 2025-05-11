using BLWSDAI.Data;
using BLWSDAI.Services.Interfaces;
using BLWSDAI.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using BLWSDAI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using System.Net.NetworkInformation;
using System.Net;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient(); // Required for SMS

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "BLWSDAI API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token like this: Bearer {your token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
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

// JWT Auth
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var config = builder.Configuration.GetSection("Jwt");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = config["Issuer"],
        ValidAudience = config["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Key"]))
    };
});

builder.Services.AddAuthorization();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);

dataSourceBuilder.MapEnum<UserRoleEnum>("user_role_enum");
dataSourceBuilder.MapEnum<PurokEnum>("purok_enum");
dataSourceBuilder.MapEnum<ConsumerStatusEnum>("consumer_status_enum");
dataSourceBuilder.MapEnum<NotifPrefEnum>("notif_pref_enum");
dataSourceBuilder.MapEnum<BillStatusEnum>("bill_status_enum");
dataSourceBuilder.MapEnum<PaymentTypeEnum>("payment_type_enum");

var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(dataSource, npgsqlOptions =>
    {
        npgsqlOptions.MapEnum<UserRoleEnum>();
    })
    .UseSnakeCaseNamingConvention();
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IConsumerService, ConsumerService>();
builder.Services.AddScoped<IReadingService, ReadingService>();
builder.Services.AddScoped<IMotherMeterReadingService, MotherMeterReadingService>();
builder.Services.AddScoped<IRatesInfoService, RatesInfoService>();
builder.Services.AddScoped<ISalaryInfoService, SalaryInfoService>();
builder.Services.AddScoped<IBillService, BillService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IOtherExpenseService, OtherExpenseService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

builder.Services.AddScoped<JwtService>();
builder.Services.AddHttpClient(); //  for Semaphore


// Get local IP address dynamically
string localIp = GetLocalIpAddress();

// Add CORS policy for production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowProduction", policy =>
    {
        policy.WithOrigins(
            "https://your-frontend-domain.vercel.app", // Add your Vercel domain here
            "http://localhost:3000" // Keep local development support
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Kestrel Server Binding
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    // Listen on all available IP addresses for HTTP and HTTPS
    serverOptions.ListenAnyIP(5112);  // HTTP
    serverOptions.ListenAnyIP(7295, listenOptions =>  // HTTPS
    {
        listenOptions.UseHttps();  // Enable HTTPS
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowProduction"); // Use CORS in development
}
else
{
    app.UseHttpsRedirection(); // Force HTTPS in production
    app.UseCors("AllowProduction"); // Use CORS in production
}

app.UseDefaultFiles(); // serves index.html by default
app.UseStaticFiles();  // serves files from wwwroot

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


// Helper function to get the local IP address
string GetLocalIpAddress()
{
    string localIp = "localhost"; // Fallback if it can't find a valid IP

    foreach (var networkInterface in NetworkInterface.GetAllNetworkInterfaces())
    {
        if (networkInterface.OperationalStatus == OperationalStatus.Up)
        {
            foreach (var ipAddress in networkInterface.GetIPProperties().UnicastAddresses)
            {
                // Look for IPv4 addresses that are not internal (localhost)
                if (ipAddress.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork &&
                    !IPAddress.IsLoopback(ipAddress.Address))
                {
                    localIp = ipAddress.Address.ToString();
                    break;
                }
            }
        }
    }

    return localIp;
}