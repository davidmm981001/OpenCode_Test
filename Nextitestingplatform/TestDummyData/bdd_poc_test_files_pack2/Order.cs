using System.Collections.Generic;

namespace Demo.Orders;

public enum OrderStatus
{
    Draft,
    Created,
    Cancelled
}

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public OrderStatus Status { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public List<OrderLine> Lines { get; set; } = new();
}

public class OrderLine
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineSubtotal { get; set; }
    public decimal LineTax { get; set; }
}
