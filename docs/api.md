# API Endpoint List

This document is the proposed API contract for the Brightloop demo. It
is intended to let the frontend build mock responses before backend
endpoints are complete.

The mission plan requires sign-up/login, Admin and Customer roles,
admin-assigned Staff access, product/variant/plan/tax setup,
subscription lifecycle, batch invoicing, discounts, payments, a finance
dashboard, and a read-only customer portal.

> **Contract note:** The mission plan specifies features, not exact
> URLs, HTTP methods, or JSON field names. The routes and payloads below
> are a suggested REST-style contract for the team to implement
> consistently. Confirm names and optional fields with the backend owner
> before treating this as a finalized API specification.

## 1. Conventions

-   Base URL: `/api`
-   JSON request and response bodies.
-   Authentication: bearer access token in
    `Authorization: Bearer <token>`.
-   IDs are opaque strings in examples; the backend may use UUIDs or
    another consistent format.
-   Dates use ISO 8601 (`YYYY-MM-DD`); timestamps use ISO 8601 with
    timezone.
-   Monetary values are decimal strings in API payloads to avoid
    floating-point rounding errors.
-   List endpoints should support pagination. Suggested query
    parameters: `page`, `page_size`.
-   All authorization and business-rule validation must be enforced
    server-side.

### Suggested response shape

Success:

``` json
{
  "data": {},
  "meta": {}
}
```

Error:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Quantity is below the plan minimum.",
    "details": {
      "quantity": "Minimum quantity is 2."
    }
  }
}
```

Suggested status codes: `200` success, `201` created, `204` successful
delete/no body, `400` malformed request, `401` unauthenticated, `403`
forbidden, `404` not found, `409` state/conflict or duplicate resource,
and `422` validation failure.

## 2. Authentication and users

  ------------------------------------------------------------------------------
  Method            Endpoint                 Purpose           Access
  ----------------- ------------------------ ----------------- -----------------
  `POST`            `/auth/signup`           Create a customer Public
                                             account; enforce  
                                             password rules    
                                             and unique email  

  `POST`            `/auth/login`            Authenticate and  Public
                                             return access     
                                             token and user    
                                             details           

  `GET`             `/auth/me`               Return the        Authenticated
                                             current user's    
                                             profile and role  

  `GET`             `/users`                 List users for    Admin
                                             staff/role        
                                             administration    

  `PATCH`           `/users/{userId}/role`   Assign or change  Admin
                                             a user's role,    
                                             including Staff   
  ------------------------------------------------------------------------------

### Sign-up request

``` json
{
  "name": "Asha",
  "email": "asha@example.com",
  "password": "ExamplePassword123!"
}
```

### Login request and response

``` json
{
  "email": "asha@example.com",
  "password": "ExamplePassword123!"
}
```

``` json
{
  "data": {
    "access_token": "mock-access-token",
    "token_type": "Bearer",
    "user": {
      "id": "user_001",
      "name": "Asha",
      "email": "asha@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

Roles used in the demo: `ADMIN`, `STAFF`, `CUSTOMER`. The mission plan
explicitly identifies Admin and Customer sign-up/login roles and says
Staff is assigned by an admin. Do not expose role assignment in public
sign-up.

## 3. Products, variants, plans, and taxes

  ----------------------------------------------------------------------------------------
  Method            Endpoint                           Purpose           Access
  ----------------- ---------------------------------- ----------------- -----------------
  `GET`             `/products`                        List products     Authenticated

  `POST`            `/products`                        Create a product  Admin/Staff

  `GET`             `/products/{productId}`            Get product       Authenticated
                                                       details and       
                                                       variants          

  `POST`            `/products/{productId}/variants`   Add a product     Admin/Staff
                                                       variant           

  `GET`             `/plans`                           List subscription Authenticated
                                                       plans             

  `POST`            `/plans`                           Create a monthly  Admin/Staff
                                                       plan with minimum 
                                                       quantity and end  
                                                       behavior          

  `GET`             `/plans/{planId}`                  Get plan details  Authenticated

  `GET`             `/taxes`                           List tax          Admin/Staff
                                                       configurations    

  `POST`            `/taxes`                           Create a tax      Admin/Staff
                                                       configuration     
  ----------------------------------------------------------------------------------------

### Product example

``` json
{
  "data": {
    "id": "product_001",
    "name": "Workspace",
    "type": "SERVICE",
    "sale_price": "100.00",
    "cost_price": "40.00",
    "notes": null,
    "variants": [
      {
        "id": "variant_001",
        "product_id": "product_001",
        "attribute": "Brand",
        "value": "Odoo",
        "price_extra": "560.00"
      }
    ]
  }
}
```

**Decision:** a variant is an attribute value with a `price_extra`, which
is added to the product's `sale_price` for every seat. The Odoo brand is
therefore `attribute: "Brand"`, `value: "Odoo"`, `price_extra: "560.00"`,
and the per-seat price becomes 660.00. The extra is recurring with the
subscription, not a one-time charge or a tax.

### Plan creation example

``` json
{
  "name": "Monthly Workspace",
  "product_variant_id": "variant_001",
  "billing_interval": "MONTH",
  "minimum_quantity": 2,
  "end_behavior": "AUTO_CLOSE",
  "available_from": "2026-01-01",
  "available_to": null
}
```

The response adds `product_id` and `unit_price`, which is computed from
the product and variant (for example, `"660.00"`). Supported billing
intervals are `DAY`, `WEEK`, `MONTH`, and `YEAR`. Supported end behaviors
are `AUTO_CLOSE` and `MANUAL_CLOSE`. `minimum_quantity` defaults to 1, and
`available_to` must be on or after `available_from`.

### Tax example

``` json
{
  "name": "Standard tax",
  "rate_percent": "10.00"
}
```

### Update and delete

The catalog also supports these endpoints. Writes require Admin or Staff.

  --------------------------------------------------------------------------------
  Method            Endpoint                           Purpose
  ----------------- ---------------------------------- ---------------------------
  `GET`             `/products/{productId}/variants`   List a product's variants

  `PATCH`           `/products/{productId}`            Change given product fields

  `DELETE`          `/products/{productId}`            Delete a product (204)

  `PATCH`           `/variants/{variantId}`            Change given variant fields

  `DELETE`          `/variants/{variantId}`            Delete a variant (204)

  `PATCH`           `/plans/{planId}`                  Change given plan fields

  `DELETE`          `/plans/{planId}`                  Delete a plan (204)
  --------------------------------------------------------------------------------

`PATCH` validates the full record after the change, so date ranges are
checked against the stored values. An empty `PATCH` body returns 422.
Deleting a variant or product that a plan uses returns 409 `CONFLICT`.
`GET /plans` accepts `product_variant_id` to filter the list.

## 4. Subscriptions

  ------------------------------------------------------------------------------------------------------
  Method            Endpoint                                      Purpose              Access
  ----------------- --------------------------------------------- -------------------- -----------------
  `GET`             `/subscriptions`                              List subscriptions;  Admin/Staff
                                                                  support pagination   
                                                                  and filters          

  `POST`            `/subscriptions`                              Create a Draft       Admin/Staff
                                                                  subscription from a  
                                                                  plan                 

  `GET`             `/subscriptions/{subscriptionId}`             Get subscription     Admin/Staff;
                                                                  details              owner via portal

  `POST`            `/subscriptions/{subscriptionId}/confirm`     Move Draft →         Admin/Staff
                                                                  Confirmed            

  `POST`            `/subscriptions/{subscriptionId}/activate`    Move Confirmed →     Admin/Staff
                                                                  Active               

  `POST`            `/subscriptions/{subscriptionId}/close`       Move Active → Closed Admin/Staff

  `POST`            `/subscriptions/{subscriptionId}/duplicate`   Duplicate a          Admin/Staff
                                                                  subscription as the  
                                                                  quotation-template   
                                                                  substitute           
  ------------------------------------------------------------------------------------------------------

### Create subscription request

``` json
{
  "customer_id": "user_001",
  "plan_id": "plan_001",
  "quantity": 3,
  "start_date": "2026-10-01"
}
```

### Subscription response

``` json
{
  "data": {
    "id": "sub_001",
    "customer_id": "user_001",
    "plan_id": "plan_001",
    "quantity": 3,
    "status": "DRAFT",
    "start_date": "2026-10-01",
    "end_behavior": "AUTO_CLOSE"
  }
}
```

Allowed states and transitions:

``` text
DRAFT → CONFIRMED → ACTIVE → CLOSED
```

The backend must reject invalid transitions and quantities below the
plan minimum. The frontend should update its displayed status from the
API response rather than assuming a transition succeeded.

Suggested list filters: `status`, `customer_id`, `plan_id`.

## 5. Invoices and batch billing

Invoices are created by the batch run. Statuses: `DRAFT`, `CONFIRMED`,
`PAID`, `CANCELLED`. `PAID` is set by the payments module.

  ------------------------------------------------------------------------------------
  Method            Endpoint                          Purpose              Access
  ----------------- --------------------------------- -------------------- -----------
  `GET`             `/invoices`                       List invoices. Filters: Admin/Staff
                                                      `status`,
                                                      `subscription_id`

  `GET`             `/invoices/{invoiceId}`           Get one invoice      Admin/Staff

  `POST`            `/invoices/{invoiceId}/confirm`   DRAFT -> CONFIRMED   Admin/Staff

  `POST`            `/invoices/{invoiceId}/cancel`    DRAFT or CONFIRMED   Admin/Staff
                                                      -> CANCELLED

  `POST`            `/billing/run`                    Create every invoice Admin/Staff
                                                      due as of a date
  ------------------------------------------------------------------------------------

### Batch billing request

``` json
{
  "as_of": "2026-10-15"
}
```

### Batch billing response

``` json
{
  "data": {
    "as_of": "2026-10-15",
    "created_count": 1,
    "skipped_count": 0,
    "invoices": [
      {
        "id": "...",
        "number": "INV-000001",
        "subscription_id": "...",
        "period_start": "2026-10-01",
        "period_end": "2026-11-01",
        "total": "330.00"
      }
    ]
  }
}
```

How a run works:

-   Only `ACTIVE` subscriptions whose start date is on or before `as_of`
    are considered.
-   Each subscription is billed for every period that has started by
    `as_of` and is not yet invoiced. A missed run catches up on the next
    run, so nothing is skipped.
-   A period starting on or after the subscription's `expiry_date` is
    not billed.
-   All invoices in a run are created in one database transaction. If any
    step fails, none are kept.
-   A subscription with nothing due counts toward `skipped_count`.
-   Running again for the same date creates nothing new. The database
    enforces one invoice per `(subscription_id, period_start)`, and runs
    take a lock so concurrent requests cannot both create the same invoice.

### Invoice amounts

Each invoice stores quantity, unit price, subtotal, discount (0.00 until
the discount engine exists), tax rate, tax amount, and total. Tax is
calculated on the taxable amount, rounded half up to the cent. See
`docs/billing-rules.md` section 5.

Invoice due date: the period start plus the subscription's
`payment_terms_days` (default 15).

## 4a. Subscription lifecycle (reference)

Subscriptions move through these actions. Each route is
`POST /subscriptions/{subscriptionId}/{action}`, and returns 409
`INVALID_TRANSITION` for any action the current state does not allow.

  ----------------------------------------------------
  From        Action        To
  ----------- ------------- ----------------------------
  DRAFT       `confirm`     CONFIRMED

  CONFIRMED   `activate`    ACTIVE

  ACTIVE      `close`       CLOSED
  ----------------------------------------------------

CLOSED is final. The database and the state machine both enforce this.

## 6. Discount rules

  ----------------------------------------------------------------------------------
  Method            Endpoint                     Purpose           Access
  ----------------- ---------------------------- ----------------- -----------------
  `GET`             `/discount-rules`            List discount     Admin
                                                 rules             

  `POST`            `/discount-rules`            Create a          Admin
                                                 percentage        
                                                 discount rule     

  `GET`             `/discount-rules/{ruleId}`   Get rule details  Admin

  `PATCH`           `/discount-rules/{ruleId}`   Update rule       Admin
                                                 configuration or  
                                                 enabled state     
  ----------------------------------------------------------------------------------

### Create discount rule request

``` json
{
  "name": "Three-seat discount",
  "discount_type": "PERCENT",
  "value": "10.00",
  "minimum_quantity": 3,
  "starts_on": "2026-10-01",
  "ends_on": "2026-12-31",
  "usage_limit": 100,
  "enabled": true
}
```

The discount engine applies eligible rules automatically during invoice
generation. Eligibility depends on minimum quantity, date window,
enabled state, and remaining usage. The invoice response should expose
the applied rule and discount amount so the frontend can show the
calculation.

## 7. Payments

  ----------------------------------------------------------------------------------------
  Method            Endpoint                           Purpose           Access
  ----------------- ---------------------------------- ----------------- -----------------
  `GET`             `/invoices/{invoiceId}/payments`   List payments     Admin/Staff
                                                       recorded against  
                                                       an invoice        

  `POST`            `/invoices/{invoiceId}/payments`   Record a payment  Admin/Staff
                                                       against an        
                                                       invoice           
  ----------------------------------------------------------------------------------------

### Record payment request

``` json
{
  "amount": "100.00",
  "payment_date": "2026-10-31",
  "method": "CASH",
  "reference": "receipt-001"
}
```

### Payment response

``` json
{
  "data": {
    "id": "pay_001",
    "invoice_id": "inv_001",
    "amount": "100.00",
    "payment_date": "2026-10-31",
    "method": "CASH"
  },
  "meta": {
    "invoice_status": "CONFIRMED",
    "amount_paid": "100.00",
    "balance_due": "230.00",
    "overdue": true
  }
}
```

The invoice becomes `PAID` when its remaining balance reaches zero.
Overdue is derived from the due date and outstanding balance; it need
not be stored as a manually updated status. The exact payment methods
are implementation-defined; `CASH` is an illustrative mock value.

## 8. Finance dashboard

  ----------------------------------------------------------------------------
  Method            Endpoint               Purpose           Access
  ----------------- ---------------------- ----------------- -----------------
  `GET`             `/dashboard/finance`   Return four       Admin/Staff
                                           finance summary   
                                           cards for a date  
                                           range             

  ----------------------------------------------------------------------------

Suggested query parameters: `from=2026-10-01&to=2026-10-31`.

### Suggested response

``` json
{
  "data": {
    "from": "2026-10-01",
    "to": "2026-10-31",
    "cards": {
      "total_invoiced": "125000.00",
      "total_collected": "98000.00",
      "outstanding": "27000.00",
      "overdue": "8000.00"
    }
  }
}
```

These four card labels and their aggregation definitions are a proposed
frontend-friendly contract; the mission plan requires four summary cards
and a date filter but does not define the exact metrics. Confirm the
metric definitions with the team before implementation.

## 9. Customer portal

The portal is read-only and must return only the authenticated
customer's own records. The backend must enforce ownership; hiding
another customer's records in the frontend is not sufficient.

  ------------------------------------------------------------------------------------------------
  Method            Endpoint                                   Purpose           Access
  ----------------- ------------------------------------------ ----------------- -----------------
  `GET`             `/portal/subscriptions`                    List the current  Customer
                                                               customer's        
                                                               subscriptions     

  `GET`             `/portal/subscriptions/{subscriptionId}`   View one of the   Owner only
                                                               current           
                                                               customer's        
                                                               subscriptions     

  `GET`             `/portal/invoices`                         List the current  Customer
                                                               customer's        
                                                               invoices          

  `GET`             `/portal/invoices/{invoiceId}`             View one of the   Owner only
                                                               current           
                                                               customer's        
                                                               invoices          
  ------------------------------------------------------------------------------------------------

Suggested portal invoice filters: `status`, `period_start`.

## 10. Frontend mock checklist

The frontend can mock against these flows independently:

1.  Sign up, including password-rule and duplicate-email errors.
2.  Login and role-dependent navigation for Admin, Staff, and Customer.
3.  Product/variant and monthly plan creation.
4.  Subscription creation and Draft → Confirmed → Active → Closed
    transitions.
5.  Batch billing, invoice detail, tax breakdown, and a repeated run
    that creates no duplicates.
6.  Discount rule creation and automatic discount display on the next
    eligible invoice.
7.  Payment entry, updated balance, Paid state, and overdue indication.
8.  Finance dashboard with four cards and date filtering.
9.  Customer portal showing only the signed-in customer's subscriptions
    and invoices.

## 11. Open contract decisions

The mission plan does not specify the following. The team should settle
them before the API is considered final:

-   Exact names and definitions of the four dashboard metrics.
-   Whether Staff can create/edit products, plans, subscriptions,
    invoices, or payments; this document proposes Admin/Staff access for
    operational endpoints.
-   Exact payment methods and payment reference requirements.
-   Invoice due-date policy.
-   Whether the Odoo `+560` variant adjustment is a one-time or
    recurring amount and how it is represented.
-   Whether multiple tax rates or compound taxes are supported; the demo
    only requires tax on invoices.
-   Exact pagination response metadata and maximum page size.
-   Whether closing a subscription immediately prevents the current
    period's invoice or only future invoices.
-   The precise billing-period anchor and timezone policy.

Until these are decided, use the examples above as frontend mock
fixtures, not as evidence that those policies have already been
finalized.
