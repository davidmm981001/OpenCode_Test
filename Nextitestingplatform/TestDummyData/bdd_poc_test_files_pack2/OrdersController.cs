using Microsoft.AspNetCore.Mvc;

namespace Demo.Orders;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _orderService.CreateAsync(User, request);

        if (result.Status == CreateOrderStatus.Forbidden)
            return Forbid();

        if (result.Status == CreateOrderStatus.ValidationError)
            return BadRequest(new { errors = result.Errors });

        if (result.Status == CreateOrderStatus.Conflict)
            return Conflict(new { errors = result.Errors });

        return Created($"/api/orders/{result.OrderId}", result);
    }
}
