using FluentValidation;

namespace Demo.Orders;

public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerId)
            .GreaterThan(0);

        RuleFor(x => x.Items)
            .NotNull()
            .Must(items => items.Count > 0)
            .WithMessage("At least one item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId)
                .GreaterThan(0);

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0)
                .LessThanOrEqualTo(999);

            item.RuleFor(i => i.UnitPrice)
                .GreaterThan(0);
        });
    }
}
