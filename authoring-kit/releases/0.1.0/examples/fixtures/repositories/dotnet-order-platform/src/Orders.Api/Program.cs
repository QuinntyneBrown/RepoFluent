using Orders.Api;
using Orders.Domain;
using Orders.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.Configure<OrderOptions>(builder.Configuration.GetSection("Orders"));
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<OrderRepository>();
builder.Services.AddScoped<OrderPublisher>();
builder.Services.AddHttpClient<InventoryClient>();
builder.Services.AddDynamicHandlers(builder.Configuration);

var app = builder.Build();
app.MapControllers();
app.Run();
