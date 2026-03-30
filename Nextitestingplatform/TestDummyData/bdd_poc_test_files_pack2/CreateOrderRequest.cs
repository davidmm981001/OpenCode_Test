using System.Collections.Generic;

namespace Demo.Orders;

public class CreateOrderRequest
{
    public int CustomerId { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
