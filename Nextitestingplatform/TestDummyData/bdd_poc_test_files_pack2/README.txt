BDD POC Test Pack 2 - Order Creation

This package is intended for frontend upload testing.

Included artifacts:
- requirements-specification.md
- CreateOrderRequest.cs
- CreateOrderValidator.cs
- OrdersController.cs
- OrderService.cs
- CreateOrderResult.cs
- Order.cs

Suggested behaviors your flow should detect:
- role-based access restriction
- active/inactive customer validation
- required item list
- quantity > 0
- quantity max boundary (<= 999)
- unit price > 0
- duplicate products in the same order are rejected
- product existence and active state
- insufficient stock conflict
- subtotal/tax/total calculations
- order status Created on success
- stock discount only after successful creation
- order number generation
