using System.Collections.Generic;

namespace Demo.Orders;

public enum CreateOrderStatus
{
    Success,
    Forbidden,
    ValidationError,
    Conflict
}

public class CreateOrderResult
{
    public CreateOrderStatus Status { get; set; }
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public List<string> Errors { get; set; } = new();

    public static CreateOrderResult Forbidden() => new()
    {
        Status = CreateOrderStatus.Forbidden
    };

    public static CreateOrderResult ValidationError(string error) => new()
    {
        Status = CreateOrderStatus.ValidationError,
        Errors = new List<string> { error }
    };

    public static CreateOrderResult Conflict(string error) => new()
    {
        Status = CreateOrderStatus.Conflict,
        Errors = new List<string> { error }
    };

    public static CreateOrderResult Success(int orderId, string orderNumber, decimal subtotal, decimal tax, decimal total) => new()
    {
        Status = CreateOrderStatus.Success,
        OrderId = orderId,
        OrderNumber = orderNumber,
        Subtotal = subtotal,
        Tax = tax,
        Total = total
    };
}
