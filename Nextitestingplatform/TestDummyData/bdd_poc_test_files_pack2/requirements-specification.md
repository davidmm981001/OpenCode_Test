# Functional Requirement Specification

## Feature ID
US-204

## Feature Title
Create sales order

## User Story
As a sales operator, I want to create a sales order for a customer so that the purchase can be registered and processed correctly.

## Business Context
The system allows authenticated sales operators to create orders for existing customers. Orders contain one or more order lines. Each line must reference an active product with enough stock.

## Functional Requirements
1. The sales operator must be authenticated.
2. Only users with role `SalesOperator` or `SalesManager` can create orders.
3. The customer must exist and be active.
4. The order must contain at least one item.
5. Each order item must include:
   - productId
   - quantity
   - unitPrice
6. Quantity must be greater than 0.
7. Unit price must be greater than 0.
8. The product must exist and be active.
9. The requested quantity must not exceed the available stock.
10. The system must calculate line subtotal as `quantity * unitPrice`.
11. The system must calculate order subtotal as the sum of line subtotals.
12. The system must calculate tax using the product tax rate.
13. The system must calculate total as `subtotal + tax`.
14. If any item is invalid, the order must not be created.
15. On successful creation, the order status must be `Created`.
16. On successful creation, stock must be discounted.
17. On successful creation, the system must persist an order number.

## Acceptance Criteria
- AC1: The system creates an order successfully when all data is valid.
- AC2: The system rejects the order if the user does not have permission.
- AC3: The system rejects the order if the customer is inactive.
- AC4: The system rejects the order if the item list is empty.
- AC5: The system rejects the order if any quantity is invalid.
- AC6: The system rejects the order if stock is insufficient.
- AC7: The system calculates subtotal, tax, and total correctly.
- AC8: The system reduces stock only after successful order creation.

## Known Gaps in the Requirement
The requirement does not explicitly define:
- whether duplicate products are allowed in multiple lines
- whether the order creation is transactional
- which exact HTTP status codes are returned in each failure case
- whether the system rounds tax per line or at order level
