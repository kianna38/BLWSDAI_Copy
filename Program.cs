using BLWSDAI.Data;
using BLWSDAI.Services.Interfaces;
using BLWSDAI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;
using BLWSDAI.Models;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

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

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
