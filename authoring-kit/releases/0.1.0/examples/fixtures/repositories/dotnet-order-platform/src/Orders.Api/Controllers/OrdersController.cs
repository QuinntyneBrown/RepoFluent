using Microsoft.AspNetCore.Mvc;
using Orders.Domain;

namespace Orders.Api.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrdersController(OrderService service) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrder request, CancellationToken cancellationToken)
    {
        var orderId = await service.Place(request, cancellationToken);
        return Accepted(new { orderId });
    }
}
