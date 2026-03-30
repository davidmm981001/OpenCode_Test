using System.Security.Claims;

namespace Demo.Orders;

public class OrderService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IProductRepository _productRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IStockService _stockService;
    private readonly IOrderNumberGenerator _orderNumberGenerator;

    public OrderService(
        ICustomerRepository customerRepository,
        IProductRepository productRepository,
        IOrderRepository orderRepository,
        IStockService stockService,
        IOrderNumberGenerator orderNumberGenerator)
    {
        _customerRepository = customerRepository;
        _productRepository = productRepository;
        _orderRepository = orderRepository;
        _stockService = stockService;
        _orderNumberGenerator = orderNumberGenerator;
    }

    public async Task<CreateOrderResult> CreateAsync(ClaimsPrincipal user, CreateOrderRequest request)
    {
        if (!user.IsInRole("SalesOperator") && !user.IsInRole("SalesManager"))
            return CreateOrderResult.Forbidden();

        var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
        if (customer == null)
            return CreateOrderResult.ValidationError("Customer does not exist.");

        if (!customer.IsActive)
            return CreateOrderResult.ValidationError("Customer is inactive.");

        var duplicateProductIds = request.Items
            .GroupBy(x => x.ProductId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateProductIds.Any())
            return CreateOrderResult.ValidationError("Duplicate products are not allowed in the same order.");

        var orderLines = new List<OrderLine>();
        decimal subtotal = 0;
        decimal tax = 0;

        foreach (var item in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null)
                return CreateOrderResult.ValidationError($"Product {item.ProductId} does not exist.");

            if (!product.IsActive)
                return CreateOrderResult.ValidationError($"Product {item.ProductId} is inactive.");

            var availableStock = await _stockService.GetAvailableStockAsync(item.ProductId);
            if (item.Quantity > availableStock)
                return CreateOrderResult.Conflict($"Insufficient stock for product {item.ProductId}.");

            var lineSubtotal = item.Quantity * item.UnitPrice;
            var lineTax = Math.Round(lineSubtotal * product.TaxRate, 2, MidpointRounding.AwayFromZero);

            subtotal += lineSubtotal;
            tax += lineTax;

            orderLines.Add(new OrderLine
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineSubtotal = lineSubtotal,
                LineTax = lineTax
            });
        }

        var order = new Order
        {
            OrderNumber = await _orderNumberGenerator.NextAsync(),
            CustomerId = request.CustomerId,
            Status = OrderStatus.Created,
            Subtotal = subtotal,
            Tax = tax,
            Total = subtotal + tax,
            Lines = orderLines
        };

        await _orderRepository.SaveAsync(order);

        foreach (var line in orderLines)
        {
            await _stockService.DiscountStockAsync(line.ProductId, line.Quantity);
        }

        return CreateOrderResult.Success(order.Id, order.OrderNumber, order.Subtotal, order.Tax, order.Total);
    }
}
